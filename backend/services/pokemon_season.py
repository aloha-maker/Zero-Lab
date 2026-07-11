from __future__ import annotations

import asyncio
import logging
from typing import Any

from core.supabase import SupabaseClient
from schemas.pokemon import SeasonMoveInfo, SeasonPokemonInfo, SeasonNatureInfo, SeasonEvInfo

from .pokemon_common import (
    ALL_POKEAPI_TYPES,
    TYPE_ENG_TO_JA,
)
from .type_matchup import calculate_multiplier_and_message, fetch_type_data

logger = logging.getLogger(__name__)

DEFAULT_RANK_FOR_UNKNOWN = 999

# ---------------------------------------------------------------------------
# 1. Supabaseからランキング・技・努力値データを取得
# ---------------------------------------------------------------------------

def _fetch_ranking_rows(supabase: SupabaseClient) -> list[dict]:
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
# 2. Supabaseからのポケモン詳細一括取得
# ---------------------------------------------------------------------------

def _fetch_pokemon_and_megas_from_supabase(
    supabase: SupabaseClient, pokemon_ids: list[int]
) -> tuple[list[dict], list[dict]]:
    """
    ランキングに登録されている基本ポケモンのデータと、
    同種族（species_id）に紐づくメガシンカのデータをまとめて取得する。
    """
    chunk_size = 100
    base_chunks = [pokemon_ids[i : i + chunk_size] for i in range(0, len(pokemon_ids), chunk_size)]
    
    select_query = (
        "id, species_id, form_category, form_name_ja, form_name_en, "
        "hp, attack, defense, sp_attack, sp_defense, speed, height_dm, weight_hg, image_url, "
        "species:pokemon_species!inner(national_dex_no, name_ja, name_en), "
        "pokemon_types(types(name_ja, name_en))"
    )
    
    base_pokemons = []
    for chunk in base_chunks:
        try:
            resp = supabase.table("pokemon").select(select_query).in_("id", chunk).execute()
            if resp.data:
                base_pokemons.extend(resp.data)
        except Exception:
            logger.exception("Supabase基本データチャンク取得に失敗しました (ids=%s)", chunk)
            
    # 基本ポケモンに紐づく種族IDを抽出し、メガシンカ情報を取得
    species_ids = list({p["species_id"] for p in base_pokemons if p.get("species_id") is not None})
    mega_pokemons = []
    
    if species_ids:
        s_chunks = [species_ids[i : i + chunk_size] for i in range(0, len(species_ids), chunk_size)]
        for s_chunk in s_chunks:
            try:
                resp = (
                    supabase.table("pokemon")
                    .select(select_query)
                    .in_("species_id", s_chunk)
                    .eq("form_category", "mega")
                    .execute()
                )
                if resp.data:
                    mega_pokemons.extend(resp.data)
            except Exception:
                logger.exception("Supabaseメガシンカチャンク取得に失敗しました (species_ids=%s)", s_chunk)
                
    return base_pokemons, mega_pokemons


# ---------------------------------------------------------------------------
# 3. メガシンカ分の合成 (Supabase版)
# ---------------------------------------------------------------------------

def _process_mega_forms(
    base_pokemons: list[dict],
    mega_pokemons: list[dict],
    pokemon_rank_map: dict[int, int],
    pokemon_moves_map: dict[int, list[dict]],
    pokemon_natures_map: dict[int, list[dict]],
    pokemon_evs_map: dict[int, list[dict]],
) -> list[dict]:
    """基本ポケモンとメガシンカポケモンを結合し、メガシンカ側にランキング情報をコピーする"""
    all_raw_pokemons = []
    all_raw_pokemons.extend(base_pokemons)
    
    # species_id -> 基本ポケモンのid の対応表
    species_to_base_id = {p["species_id"]: p["id"] for p in base_pokemons if p.get("species_id")}
    
    for mega in mega_pokemons:
        base_id = species_to_base_id.get(mega.get("species_id"))
        if base_id:
            mega_id = mega["id"]
            # ベースのランキング情報をメガシンカのIDにもコピー
            pokemon_rank_map[mega_id] = pokemon_rank_map.get(base_id, DEFAULT_RANK_FOR_UNKNOWN)
            pokemon_moves_map[mega_id] = pokemon_moves_map.get(base_id, [])
            pokemon_natures_map[mega_id] = pokemon_natures_map.get(base_id, [])
            pokemon_evs_map[mega_id] = pokemon_evs_map.get(base_id, [])
            
            all_raw_pokemons.append(mega)
            
    return all_raw_pokemons


# ---------------------------------------------------------------------------
# 4. 種族値・タイプ・名前の整形
# ---------------------------------------------------------------------------

def _get_display_names(p: dict) -> tuple[str, str]:
    """pokemon_detail.py と共通の命名ロジック"""
    species = p.get("species", {})
    base_name_ja = species.get("name_ja", "")
    base_name_en = species.get("name_en", "")
    
    form_category = p.get("form_category", "")
    form_name_ja = p.get("form_name_ja", "")
    form_name_en = p.get("form_name_en", "")

    if form_category == "normal":
        return base_name_ja, base_name_en
    elif form_category == "mega":
        return (
            form_name_ja if form_name_ja else base_name_ja,
            form_name_en if form_name_en else base_name_en
        )
    else:
        ja_name = f"{base_name_ja}({form_name_ja})" if form_name_ja else base_name_ja
        en_name = f"{base_name_en} ({form_name_en})" if form_name_en else base_name_en
        return ja_name, en_name


def _parse_types(p: dict) -> tuple[list[str], list[str]]:
    localized_types: list[str] = []
    english_types: list[str] = []

    for pt in p.get("pokemon_types", []):
        t_data = pt.get("types")
        if t_data:
            if t_data.get("name_ja"):
                localized_types.append(t_data["name_ja"])
            if t_data.get("name_en"):
                english_types.append(t_data["name_en"].lower())

    return localized_types, english_types


def _parse_base_stats(p: dict) -> dict[str, int]:
    base_stats = {
        "hp": p.get("hp", 0),
        "attack": p.get("attack", 0),
        "defense": p.get("defense", 0),
        "sp_attack": p.get("sp_attack", 0),
        "sp_defense": p.get("sp_defense", 0),
        "speed": p.get("speed", 0),
    }
    
    hp_val = base_stats["hp"]
    base_stats["hp_times_defense"] = hp_val * base_stats["defense"]
    base_stats["hp_times_sp_defense"] = hp_val * base_stats["sp_defense"]

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
    actual_rank = pokemon_rank_map.get(poke_id, DEFAULT_RANK_FOR_UNKNOWN)

    localized_name, english_name = _get_display_names(p)
    localized_types, english_types = _parse_types(p)
    base_stats = _parse_base_stats(p)

    raw_moves = pokemon_moves_map.get(poke_id, [])
    season_moves = _build_season_moves(raw_moves, base_stats, localized_types)
    
    raw_natures = pokemon_natures_map.get(poke_id, [])
    season_natures = _build_season_natures(raw_natures)
    
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
        weight_kg=p.get("weight_hg", 0) / 10.0,
        height_m=p.get("height_dm", 0) / 10.0,
        moves=[],
        season_moves=season_moves,
        season_natures=season_natures,
        season_evs=season_evs,
        max_power_times_atk_by_type=max_atk_by_type,
        type_efficacies=type_efficacies,
        image_url=p.get("image_url") or "",
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

    pokemon_rank_map, pokemon_moves_map, pokemon_ids, pokemon_natures_map, pokemon_evs_map = _extract_rank_and_moves(rows)
    if not pokemon_ids:
        return []

    # Supabaseからベースポケモンとメガシンカデータを取得
    base_pokemons, mega_pokemons = _fetch_pokemon_and_megas_from_supabase(supabase, pokemon_ids)
    
    # データを結合し、メガシンカにベースのランキング情報を付与
    all_raw_pokemon_dicts = _process_mega_forms(
        base_pokemons, mega_pokemons, pokemon_rank_map, pokemon_moves_map, pokemon_natures_map, pokemon_evs_map
    )

    type_data_tasks = [fetch_type_data(supabase,t_name) for t_name in ALL_POKEAPI_TYPES]
    type_data_results = await asyncio.gather(*type_data_tasks)
    type_data_map = dict(zip(ALL_POKEAPI_TYPES, type_data_results))

    detailed_pokemons = [
        _build_season_pokemon_info(p, pokemon_rank_map, pokemon_moves_map, type_data_map, pokemon_natures_map, pokemon_evs_map)
        for p in all_raw_pokemon_dicts
    ]

    detailed_pokemons.sort(key=lambda x: x.rank)
    return detailed_pokemons