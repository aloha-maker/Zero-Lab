from __future__ import annotations

import asyncio
import logging
from typing import Any

import httpx

from core.supabase import SupabaseClient
from schemas.pokemon import SeasonMoveInfo, SeasonPokemonInfo, SeasonNatureInfo, SeasonEvInfo

from .pokemon_common import (
    ALL_POKEAPI_TYPES,
    DEFAULT_LIMITS,
    DEFAULT_TIMEOUT,
    JAPANESE_LANGUAGE_ID,
    POKEAPI_GRAPHQL_URL,
    STAT_NAME_MAP,
    TYPE_ENG_TO_JA,
)
from .pokemon_mega import fetch_all_mega_forms_from_csv, fetch_mega_pokemon_data_from_pokeapi
from .type_matchup import calculate_multiplier_and_message, fetch_type_data

logger = logging.getLogger(__name__)

GRAPHQL_CHUNK_SIZE = 20
DEFAULT_RANK_FOR_UNKNOWN = 999

_CHUNK_QUERY = f"""
query($ids: [Int!]!) {{
  pokemon_v2_pokemon(where: {{id: {{_in: $ids}}}}, order_by: {{id: asc}}) {{
    id
    name
    pokemon_v2_pokemonspecy {{
      pokemon_v2_pokemonspeciesnames(where: {{language_id: {{_eq: {JAPANESE_LANGUAGE_ID}}}}}) {{
        name
      }}
    }}
    pokemon_v2_pokemontypes {{
      pokemon_v2_type {{
        pokemon_v2_typenames(where: {{language_id: {{_eq: {JAPANESE_LANGUAGE_ID}}}}}) {{
          name
        }}
      }}
    }}
    pokemon_v2_pokemonstats {{
      base_stat
      pokemon_v2_stat {{
        name
      }}
    }}
  }}
}}
"""


def _sprite_url(pokemon_id: int) -> str:
    return (
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/"
        f"{pokemon_id}.png"
    )


# ---------------------------------------------------------------------------
# 1. Supabaseからランキング・技・努力値データを取得
# ---------------------------------------------------------------------------

def _fetch_ranking_rows(supabase: SupabaseClient) -> list[dict]:
    """
    pokemon_rankings テーブルから、ランキング・PokeAPI ID対応・各種ランキングを
    まとめて取得する(Supabaseのネスト select 機能を利用)。
    """
    res = (
        supabase.table("pokemon_rankings")
        .select(
            """
            id,
            rank,
            name,
            pokemon_battle_db_mapping!inner(poke_api_id),
            pokemon_moves_rankings!inner(move_name, move_type, category, power),
            pokemon_natures_rankings!inner(rank, nature_name),
            pokemon_ev_rankings!inner(
                view_mode, rank, spread_name, parent_spread_name, usage_rate,
                hp, attack, defense, sp_attack, sp_defense, speed, is_minor
            )
            """
        )
        .order("rank", desc=False)
        .execute()
    )
    return res.data or []


def _extract_rank_and_moves(
    rows: list[dict],
) -> tuple[dict[int, int], dict[int, list[dict]], list[int], dict[int, list[dict]], dict[int, list[dict]]]:
    """
    Supabaseの行データから、
    - pokemon_id -> rank の対応
    - pokemon_id -> 技リスト の対応
    - pokemon_id -> 性格リスト の対応
    - pokemon_id -> 努力値リスト の対応
    - 対象となる pokemon_id のリスト
    を組み立てる。
    """
    pokemon_rank_map: dict[int, int] = {}
    pokemon_moves_map: dict[int, list[dict]] = {}
    pokemon_natures_map: dict[int, list[dict]] = {}
    pokemon_evs_map: dict[int, list[dict]] = {}
    pokemon_ids: list[int] = []

    for row in rows:
        rank_value = row.get("rank")
        mapping_list = row.get("pokemon_battle_db_mapping")
        moves_list = row.get("pokemon_moves_rankings", [])
        natures_list = row.get("pokemon_natures_rankings", [])
        evs_list = row.get("pokemon_ev_rankings", [])

        if not mapping_list or not isinstance(mapping_list, list):
            continue

        mapping_data = mapping_list[0]
        api_id = mapping_data.get("poke_api_id")
        if api_id is None:
            continue

        api_id = int(api_id)
        pokemon_ids.append(api_id)
        pokemon_rank_map[api_id] = int(rank_value) if rank_value is not None else DEFAULT_RANK_FOR_UNKNOWN
        
        pokemon_moves_map[api_id] = [
            {
                "move_name": m.get("move_name"),
                "move_type": m.get("move_type"),
                "category": m.get("category"),
                "power": m.get("power"),
            }
            for m in moves_list
        ]
        
        pokemon_natures_map[api_id] = [
            {
                "rank": n.get("rank"),
                "nature_name": n.get("nature_name"),
            }
            for n in natures_list
        ]

        pokemon_evs_map[api_id] = [
            {
                "view_mode": ev.get("view_mode"),
                "rank": ev.get("rank"),
                "spread_name": ev.get("spread_name"),
                "parent_spread_name": ev.get("parent_spread_name"),
                "usage_rate": ev.get("usage_rate"),
                "hp": ev.get("hp"),
                "attack": ev.get("attack"),
                "defense": ev.get("defense"),
                "sp_attack": ev.get("sp_attack"),
                "sp_defense": ev.get("sp_defense"),
                "speed": ev.get("speed"),
                "is_minor": ev.get("is_minor"),
            }
            for ev in evs_list
        ]

    return pokemon_rank_map, pokemon_moves_map, pokemon_ids, pokemon_natures_map, pokemon_evs_map


# ---------------------------------------------------------------------------
# 2. GraphQLからの並列チャンク取得
# ---------------------------------------------------------------------------

async def _fetch_chunk_from_graphql(client: httpx.AsyncClient, ids: list[int]) -> list[dict]:
    try:
        response = await client.post(
            POKEAPI_GRAPHQL_URL,
            json={"query": _CHUNK_QUERY, "variables": {"ids": ids}},
            headers={"Content-Type": "application/json"},
        )
        response.raise_for_status()
        return response.json().get("data", {}).get("pokemon_v2_pokemon", [])
    except Exception:
        logger.exception("GraphQLチャンク取得に失敗しました (ids=%s)", ids)
        return []


async def _fetch_all_pokemon_chunks(pokemon_ids: list[int]) -> list[dict]:
    chunks = [
        pokemon_ids[i : i + GRAPHQL_CHUNK_SIZE]
        for i in range(0, len(pokemon_ids), GRAPHQL_CHUNK_SIZE)
    ]

    raw_pokemons: list[dict] = []
    async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT, limits=DEFAULT_LIMITS) as client:
        tasks = [_fetch_chunk_from_graphql(client, chunk) for chunk in chunks]
        results = await asyncio.gather(*tasks)
        for result_list in results:
            raw_pokemons.extend(result_list)
    return raw_pokemons


# ---------------------------------------------------------------------------
# 3. メガシンカ分の合成
# ---------------------------------------------------------------------------

async def _append_mega_forms(
    raw_pokemons: list[dict],
    pokemon_rank_map: dict[int, int],
    pokemon_moves_map: dict[int, list[dict]],
    pokemon_natures_map: dict[int, list[dict]],
    pokemon_evs_map: dict[int, list[dict]],
) -> list[dict]:
    mega_forms = await fetch_all_mega_forms_from_csv()
    all_raw_pokemon_dicts: list[dict] = []

    for p_dict in raw_pokemons:
        all_raw_pokemon_dicts.append(p_dict)

        base_eng_name = p_dict.get("name", "").lower()
        if not base_eng_name:
            continue

        matched_megas = [m for m in mega_forms if base_eng_name in m["identifier"]]

        for mega_info in matched_megas:
            try:
                mega_pokemon_dict = await fetch_mega_pokemon_data_from_pokeapi(
                    base_pokemon_dict=p_dict,
                    form_poke_id=mega_info["form_poke_id"],
                    form_suffix=mega_info["form_suffix"],
                )

                mega_id = mega_pokemon_dict["id"]
                base_id = p_dict["id"]
                pokemon_rank_map[mega_id] = pokemon_rank_map.get(base_id, DEFAULT_RANK_FOR_UNKNOWN)
                pokemon_moves_map[mega_id] = pokemon_moves_map.get(base_id, [])
                pokemon_natures_map[mega_id] = pokemon_natures_map.get(base_id, [])
                pokemon_evs_map[mega_id] = pokemon_evs_map.get(base_id, [])

                all_raw_pokemon_dicts.append(mega_pokemon_dict)

            except Exception:
                logger.exception(
                    "メガシンカ生辞書の構築に失敗しました (%s)", mega_info["identifier"]
                )
                continue

    return all_raw_pokemon_dicts


# ---------------------------------------------------------------------------
# 4. 種族値・タイプの整形
# ---------------------------------------------------------------------------

def _parse_types(p: dict) -> tuple[list[str], list[str]]:
    localized_types: list[str] = []
    english_types: list[str] = []

    for t in p.get("pokemon_v2_pokemontypes", []):
        type_names = t.get("pokemon_v2_type", {}).get("pokemon_v2_typenames", [])
        ja_t_name = type_names[0]["name"] if type_names else None
        if ja_t_name:
            localized_types.append(ja_t_name)

        type_obj = t.get("pokemon_v2_type") or {}
        eng_t_name = type_obj.get("name")

        if eng_t_name:
            english_types.append(str(eng_t_name).lower())
        elif ja_t_name:
            backup_eng = [eng for eng, ja in TYPE_ENG_TO_JA.items() if ja == ja_t_name]
            if backup_eng:
                english_types.append(backup_eng[0].lower())

    return localized_types, english_types


def _parse_base_stats(p: dict) -> dict[str, int]:
    base_stats: dict[str, int] = {}

    for s in p.get("pokemon_v2_pokemonstats", []):
        raw_stat_name = s.get("pokemon_v2_stat", {}).get("name")
        mapped_name = STAT_NAME_MAP.get(raw_stat_name, raw_stat_name)
        base_stats[mapped_name] = s["base_stat"]

    hp_val = base_stats.get("hp", 0)
    base_stats["hp_times_defense"] = hp_val * base_stats.get("defense", 0)
    base_stats["hp_times_sp_defense"] = hp_val * base_stats.get("sp_defense", 0)

    return base_stats


def _build_season_moves(
    raw_moves: list[dict],
    base_stats: dict[str, int],
    localized_types: list[str],
) -> list[SeasonMoveInfo]:
    attack_val = base_stats.get("attack", 0)
    sp_attack_val = base_stats.get("sp_attack", 0)

    season_moves: list[SeasonMoveInfo] = []
    for m in raw_moves:
        if m.get("move_name") is None:
            continue

        power = m.get("power")
        if power is None:
            power_times_atk = 0
        else:
            atk_stat = attack_val if m.get("category") == "物理" else sp_attack_val
            stab_bonus = 1.5 if m.get("move_type") in localized_types else 1.0
            power_times_atk = int(power * atk_stat * stab_bonus)

        season_moves.append(
            SeasonMoveInfo(
                move_name=m.get("move_name"),
                move_type=m.get("move_type"),
                category=m.get("category"),
                power=power,
                power_times_atk=power_times_atk,
            )
        )

    return season_moves


def _build_season_natures(raw_natures: list[dict]) -> list[SeasonNatureInfo]:
    season_natures: list[SeasonNatureInfo] = []
    for m in raw_natures:
        if m.get("nature_name") is None:
            continue
        
        season_natures.append(
            SeasonNatureInfo(
                rank=m.get("rank"),
                nature_name=m.get("nature_name"),
            )
        )
    return season_natures


def _build_season_evs(raw_evs: list[dict]) -> list[SeasonEvInfo]:
    """努力値リストから SeasonEvInfo のリストを組み立てる。"""
    season_evs: list[SeasonEvInfo] = []
    for ev in raw_evs:
        if ev.get("rank") is None:
            continue
            
        season_evs.append(
            SeasonEvInfo(
                view_mode=ev.get("view_mode"),
                rank=ev.get("rank"),
                spread_name=ev.get("spread_name"),
                parent_spread_name=ev.get("parent_spread_name"),
                usage_rate=ev.get("usage_rate"),
                hp=ev.get("hp"),
                attack=ev.get("attack"),
                defense=ev.get("defense"),
                sp_attack=ev.get("sp_attack"),
                sp_defense=ev.get("sp_defense"),
                speed=ev.get("speed"),
                is_minor=ev.get("is_minor"),
            )
        )
    return season_evs


def _build_max_power_by_type(season_moves: list[SeasonMoveInfo]) -> dict[str, int]:
    max_atk_by_type: dict[str, int] = {}
    for move in season_moves:
        m_type = move.move_type
        m_val = move.power_times_atk
        if m_type not in max_atk_by_type or m_val > max_atk_by_type[m_type]:
            max_atk_by_type[m_type] = m_val
    return max_atk_by_type


def _build_type_efficacies(
    english_types: list[str], type_data_map: dict[str, Any]
) -> dict[str, float]:
    pokemon_type_efficacies: dict[str, float] = {}
    for t_name in ALL_POKEAPI_TYPES:
        t_data = type_data_map[t_name]
        multiplier, _ = calculate_multiplier_and_message(t_data, defenders=english_types)
        ja_type_name = TYPE_ENG_TO_JA.get(t_name, t_name)
        pokemon_type_efficacies[ja_type_name] = multiplier
        pokemon_type_efficacies[t_name] = multiplier
    return pokemon_type_efficacies


def _build_season_pokemon_info(
    p: dict,
    pokemon_rank_map: dict[int, int],
    pokemon_moves_map: dict[int, list[dict]],
    type_data_map: dict[str, Any],
    pokemon_natures_map: dict[int, list[dict]],
    pokemon_evs_map: dict[int, list[dict]],
) -> SeasonPokemonInfo:
    poke_id = p["id"]
    english_name = p.get("name", "")
    actual_rank = pokemon_rank_map.get(poke_id, DEFAULT_RANK_FOR_UNKNOWN)

    ja_names = p.get("pokemon_v2_pokemonspecy", {}).get("pokemon_v2_pokemonspeciesnames", [])
    localized_name = ja_names[0]["name"] if ja_names else english_name

    localized_types, english_types = _parse_types(p)
    base_stats = _parse_base_stats(p)

    raw_moves = pokemon_moves_map.get(poke_id, [])
    season_moves = _build_season_moves(raw_moves, base_stats, localized_types)
    
    raw_natures = pokemon_natures_map.get(poke_id, [])
    season_natures = _build_season_natures(raw_natures)
    
    # 👇 努力値モデルのビルド処理を追加
    raw_evs = pokemon_evs_map.get(poke_id, [])
    season_evs = _build_season_evs(raw_evs)
    
    max_atk_by_type = _build_max_power_by_type(season_moves)
    type_efficacies = _build_type_efficacies(english_types, type_data_map)    

    return SeasonPokemonInfo(
        id=poke_id,
        rank=actual_rank,
        name=localized_name,
        english_name=english_name,
        types=localized_types,
        abilities=[],
        base_stats=base_stats,
        weight_kg=0.0,
        height_m=0.0,
        moves=[],
        season_moves=season_moves,
        season_natures=season_natures,
        # 👇 Pydanticモデル側のプロパティ名（例: season_evs）に合わせてアサインしてください
        season_evs=season_evs,
        max_power_times_atk_by_type=max_atk_by_type,
        type_efficacies=type_efficacies,
        image_url=_sprite_url(poke_id),
    )


# ---------------------------------------------------------------------------
# エントリーポイント
# ---------------------------------------------------------------------------

async def get_active_season_pokemon_details(
    supabase: SupabaseClient,
) -> list[SeasonPokemonInfo]:
    rows = _fetch_ranking_rows(supabase)
    if not rows:
        return []

    # 👇 戻り値と代入に pokemon_evs_map を追加
    pokemon_rank_map, pokemon_moves_map, pokemon_ids, pokemon_natures_map, pokemon_evs_map = _extract_rank_and_moves(rows)
    if not pokemon_ids:
        return []

    raw_pokemons = await _fetch_all_pokemon_chunks(pokemon_ids)
    all_raw_pokemon_dicts = await _append_mega_forms(
        raw_pokemons, pokemon_rank_map, pokemon_moves_map, pokemon_natures_map, pokemon_evs_map
    )

    type_data_tasks = [fetch_type_data(t_name) for t_name in ALL_POKEAPI_TYPES]
    type_data_results = await asyncio.gather(*type_data_tasks)
    type_data_map = dict(zip(ALL_POKEAPI_TYPES, type_data_results))

    detailed_pokemons = [
        _build_season_pokemon_info(p, pokemon_rank_map, pokemon_moves_map, type_data_map, pokemon_natures_map, pokemon_evs_map)
        for p in all_raw_pokemon_dicts
    ]

    detailed_pokemons.sort(key=lambda x: x.rank)
    return detailed_pokemons