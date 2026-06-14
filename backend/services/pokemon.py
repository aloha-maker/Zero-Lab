import httpx
import os
import asyncio
from fastapi import HTTPException
from async_lru import alru_cache
from schemas.pokemon import PokemonInfo, PokemonListItem,SeasonPokemonInfo,SeasonMoveInfo
from core.config import settings

POKEAPI_BASE_URL = "https://pokeapi.co/api/v2/"
POKEAPI_GRAPHQL_URL = "https://beta.pokeapi.co/graphql/v1beta"

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

timeout = httpx.Timeout(20.0, connect=10.0)
limits = httpx.Limits(max_keepalive_connections=20, max_connections=50)


def get_localized_name(names_list: list, target_lang: str, default_name: str) -> str:
    target_lang_lower = target_lang.lower()
    for name_entry in names_list:
        if name_entry["language"]["name"].lower() == target_lang_lower:
            return name_entry["name"]
    return default_name


@alru_cache(maxsize=256)
async def fetch_pokemon_data(name_or_id: str) -> PokemonInfo:
    """ポケモン詳細情報を取得する（図鑑ページ用・種族値・技・特性含む）"""
    lang = settings.TARGET_LANGUAGE
    query = str(name_or_id).lower()

    async with httpx.AsyncClient(timeout=timeout) as client:
        try:
            pokemon_res = await client.get(f"{POKEAPI_BASE_URL}pokemon/{query}")
            pokemon_res.raise_for_status()
        except httpx.HTTPStatusError as exc:
            if exc.response.status_code == 404:
                raise HTTPException(status_code=404, detail=f"'{name_or_id}' は見つかりませんでした。")
            raise HTTPException(status_code=exc.response.status_code, detail="PokeAPIエラー")
        except httpx.RequestError as exc:
            raise HTTPException(status_code=503, detail=f"PokeAPIサーバーに接続できません: {exc}")

        pokemon_data = pokemon_res.json()
        base_name = pokemon_data.get("name")
        poke_id = pokemon_data.get("id")

        base_stats = {stat["stat"]["name"]: stat["base_stat"] for stat in pokemon_data.get("stats", [])}
        moves = [move["move"]["name"] for move in pokemon_data.get("moves", [])]

        species_url = f"{POKEAPI_BASE_URL}pokemon-species/{poke_id}"
        type_urls = [t["type"]["url"] for t in pokemon_data.get("types", [])]
        ability_urls = [a["ability"]["url"] for a in pokemon_data.get("abilities", [])]

        requests = [client.get(species_url)] + \
                   [client.get(url) for url in type_urls] + \
                   [client.get(url) for url in ability_urls]

        try:
            responses = await asyncio.gather(*requests)
        except httpx.RequestError as exc:
            raise HTTPException(status_code=503, detail=f"PokeAPIサーバー(詳細データ)に接続できません: {exc}")

        species_res = responses[0]
        type_responses = responses[1:1 + len(type_urls)]
        ability_responses = responses[1 + len(type_urls):]

        localized_name = base_name
        english_name = base_name
        localized_types = []
        localized_abilities = []

        if species_res.status_code == 200:
            names_list = species_res.json().get("names", [])
            localized_name = get_localized_name(names_list, lang, base_name)
            english_name = get_localized_name(names_list, "en", base_name)

        for type_res in type_responses:
            if type_res.status_code == 200:
                t_data = type_res.json()
                localized_types.append(get_localized_name(t_data.get("names", []), lang, t_data.get("name")))

        for ability_res in ability_responses:
            if ability_res.status_code == 200:
                a_data = ability_res.json()
                localized_abilities.append(get_localized_name(a_data.get("names", []), lang, a_data.get("name")))

        weight_kg = pokemon_data.get("weight", 0) / 10.0
        height_m = pokemon_data.get("height", 0) / 10.0

        return PokemonInfo(
            id=poke_id,
            name=localized_name,
            english_name=english_name,
            types=localized_types,
            abilities=localized_abilities,
            base_stats=base_stats,
            weight_kg=weight_kg,
            height_m=height_m,
            moves=moves,
            image_url=pokemon_data.get("sprites", {}).get("front_default")
        )


async def _fetch_pokemon_list_by_ids(pokemon_ids: list[int]) -> list[PokemonListItem]:
    """
    pokemon_id のリストを受け取り、GraphQL で日本語名・画像だけを一括取得して返す。
    rule_id 絞り込みと全件取得の両方から呼び出す共通処理。
    language_id=11 が日本語（ja-Hrkt）に対応。
    """
    # IN句で対象IDのみ取得することで通信量を最小化
    graphql_query = """
    query($ids: [Int!]!) {
      pokemon_v2_pokemon(where: {id: {_in: $ids}}, order_by: {id: asc}) {
        id
        name
        pokemon_v2_pokemonspecy {
          pokemon_v2_pokemonspeciesnames(where: {language_id: {_eq: 11}}) {
            name
          }
        }
      }
    }
    """

    async with httpx.AsyncClient(timeout=timeout) as client:
        try:
            res = await client.post(
                POKEAPI_GRAPHQL_URL,
                json={"query": graphql_query, "variables": {"ids": pokemon_ids}},
                headers={"Content-Type": "application/json"},
            )
            res.raise_for_status()
        except httpx.RequestError as exc:
            raise HTTPException(status_code=503, detail=f"PokeAPI GraphQLに接続できません: {exc}")

        pokemons = res.json().get("data", {}).get("pokemon_v2_pokemon", [])

    items: list[PokemonListItem] = []
    for p in pokemons:
        ja_names = (p.get("pokemon_v2_pokemonspecy") or {}) \
                    .get("pokemon_v2_pokemonspeciesnames", [])
        ja_name = ja_names[0]["name"] if ja_names else p["name"]
        items.append(PokemonListItem(
            pokemon_id=p["id"],
            name=ja_name,
            english_name=p["name"],
            image_url=f"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{p['id']}.png",
        ))

    return items


async def get_pokemon_list_by_rule(rule_id: int) -> list[PokemonListItem]:
    """
    指定ルールで使用可能なポケモン一覧を返す。
    Supabase から pokemon_id を取得し、GraphQL で日本語名・画像のみ一括取得する軽量実装。
    """
    from supabase import create_client
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    res = supabase.table("rule_available_pokemons") \
        .select("pokemon_id") \
        .eq("rule_id", rule_id) \
        .execute()

    if not res.data:
        return []

    pokemon_ids = [row["pokemon_id"] for row in res.data]
    return await _fetch_pokemon_list_by_ids(pokemon_ids)


@alru_cache(maxsize=1)
async def get_all_pokemon_list() -> list[PokemonListItem]:
    """
    全ポケモンの一覧を PokeAPI GraphQL から一括取得して返す。
    結果は alru_cache でサーバー起動中メモリにキャッシュする（再起動まで再取得しない）。
    """
    graphql_query = """
    query {
      pokemon_v2_pokemon(order_by: {id: asc}) {
        id
        name
        pokemon_v2_pokemonspecy {
          pokemon_v2_pokemonspeciesnames(where: {language_id: {_eq: 11}}) {
            name
          }
        }
      }
    }
    """

    async with httpx.AsyncClient(timeout=timeout) as client:
        try:
            res = await client.post(
                POKEAPI_GRAPHQL_URL,
                json={"query": graphql_query},
                headers={"Content-Type": "application/json"},
            )
            res.raise_for_status()
        except httpx.RequestError as exc:
            raise HTTPException(status_code=503, detail=f"PokeAPI GraphQLに接続できません: {exc}")

        pokemons = res.json().get("data", {}).get("pokemon_v2_pokemon", [])

    items: list[PokemonListItem] = []
    for p in pokemons:
        ja_names = (p.get("pokemon_v2_pokemonspecy") or {}) \
                    .get("pokemon_v2_pokemonspeciesnames", [])
        ja_name = ja_names[0]["name"] if ja_names else p["name"]
        items.append(PokemonListItem(
            pokemon_id=p["id"],
            name=ja_name,
            english_name=p["name"],
            image_url=f"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{p['id']}.png",
        ))

    return items


async def _fetch_chunk_from_graphql(client: httpx.AsyncClient, ids: list[int]) -> list:
    """小分けにされたIDリスト（チャンク）をもとに、GraphQLへリクエストを送る個別タスク"""
    graphql_query = """
    query($ids: [Int!]!) {
      pokemon_v2_pokemon(where: {id: {_in: $ids}}, order_by: {id: asc}) {
        id
        name
        pokemon_v2_pokemonspecy {
          pokemon_v2_pokemonspeciesnames(where: {language_id: {_eq: 11}}) {
            name
          }
        }
        pokemon_v2_pokemontypes {
          pokemon_v2_type {
            pokemon_v2_typenames(where: {language_id: {_eq: 11}}) {
              name
            }
          }
        }
        pokemon_v2_pokemonstats {
          base_stat
          pokemon_v2_stat {
            name
          }
        }
      }
    }
    """
    try:
        response = await client.post(
            POKEAPI_GRAPHQL_URL,
            json={"query": graphql_query, "variables": {"ids": ids}},
            headers={"Content-Type": "application/json"},
        )
        response.raise_for_status()
        return response.json().get("data", {}).get("pokemon_v2_pokemon", [])
    except Exception:
        # 1つのチャンクの失敗で全体を止めないよう、エラー時は空配列を返してフォールバック
        return []


async def get_active_season_pokemon_details() -> list[PokemonInfo]:
    """
    【高速化版】
    `asyncio.gather` (Promise.all と同等) を使用し、
    PokeAPIのデータを小分けにして一斉に並列取得する。
    """
    from supabase import create_client
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    # 1. SupabaseからIDを取得
    res = (
        supabase.table("pokemon_rankings")
        .select(
            """
            id,
            rank,
            name,
            pokemon_battle_db_mapping!inner(poke_api_id, battle_db_id),
            pokemon_moves_rankings!inner(move_name, move_type, category, power)
            """
        )
        .order("rank", desc=False)  # ← ascending=True から desc=False に変更
        .execute()
    )

    if not res.data:
        return []

    pokemon_rank_map = {}
    pokemon_moves_map = {}
    pokemon_ids = []
    
    for row in res.data:
        rank_value = row.get("rank") # DBから順位を取り出す
        mapping_list = row.get("pokemon_battle_db_mapping")
        moves_list = row.get("pokemon_moves_rankings", [])
        
        if mapping_list and isinstance(mapping_list, list) and len(mapping_list) > 0:
            mapping_data = mapping_list[0]
            if "poke_api_id" in mapping_data and mapping_data["poke_api_id"] is not None:
                api_id = int(mapping_data["poke_api_id"])
                pokemon_ids.append(api_id)
                # 辞書に「このAPIのIDのポケモンは○位」と記録しておく
                # 万が一順位が空なら999（圏外）にしておく
                pokemon_rank_map[api_id] = int(rank_value) if rank_value is not None else 999
                pokemon_moves_map[api_id] = [
                    {
                        "move_name": m.get("move_name"),
                        "move_type": m.get("move_type"),
                        "category": m.get("category"),
                        "power": m.get("power")
                    }
                    for m in moves_list
                ]

    if not pokemon_ids:
        return []

    # 💡 改善点1: IDリストを20匹ずつのグループ（チャンク）に分割
    chunk_size = 20
    chunks = [pokemon_ids[i:i + chunk_size] for i in range(0, len(pokemon_ids), chunk_size)]

    # 💡 改善点2: asyncio.gather で並列一斉実行 (Promise.all)
    raw_pokemons = []
    async with httpx.AsyncClient(timeout=timeout, limits=limits) as client:
        tasks = [_fetch_chunk_from_graphql(client, chunk) for chunk in chunks]
        results = await asyncio.gather(*tasks)
        for result_list in results:
            raw_pokemons.extend(result_list)

    # 4. 取得したデータを SeasonPokemonInfo 型に成形
    detailed_pokemons: list[SeasonPokemonInfo] = []
    
    for p in raw_pokemons:
        poke_id = p["id"]
        english_name = p["name"]
        
        # 先ほど作った辞書から、このポケモンの正式な順位を取得
        actual_rank = pokemon_rank_map.get(poke_id, 999)

        # 日本語名・タイプ・種族値の成形
        ja_names = p.get("pokemon_v2_pokemonspecy", {}).get("pokemon_v2_pokemonspeciesnames", [])
        localized_name = ja_names[0]["name"] if ja_names else english_name

        localized_types = []
        for t in p.get("pokemon_v2_pokemontypes", []):
            type_names = t.get("pokemon_v2_type", {}).get("pokemon_v2_typenames", [])
            if type_names:
                localized_types.append(type_names[0]["name"])

        base_stats = {}
        for s in p.get("pokemon_v2_pokemonstats", []):
            raw_stat_name = s.get("pokemon_v2_stat", {}).get("name")
            stat_name_map = {
                "hp": "hp",
                "attack": "attack",
                "defense": "defense",
                "special-attack": "sp_attack",
                "special-defense": "sp_defense",
                "speed": "speed"
            }
            mapped_name = stat_name_map.get(raw_stat_name, raw_stat_name)
            val = s["base_stat"]
            base_stats[mapped_name] = val
            
            # 計算用に値を保持
            if mapped_name == "hp":
                hp_val = val
            elif mapped_name == "defense":
                defense_val = val
            elif mapped_name == "sp_defense":
                sp_defense_val = val
            elif mapped_name == "attack":
                attack_val = val
            elif mapped_name == "sp_attack":
                sp_attack_val = val

        # ループ終了後に計算して格納
        base_stats["hp_times_defense"] = hp_val * defense_val
        base_stats["hp_times_sp_defense"] = hp_val * sp_defense_val
        
        # 1. まずは各技の情報を計算してインスタンス化
        raw_moves = pokemon_moves_map.get(poke_id, [])
        actual_season_moves = [
            SeasonMoveInfo(
                move_name=m.get("move_name"),
                move_type=m.get("move_type"),
                category=m.get("category"),
                power=m.get("power"),
                power_times_atk=(
                    int(
                        m.get("power") * (attack_val if m.get("category") == "物理" else sp_attack_val) * (1.5 if m.get("move_type") in localized_types else 1.0) # 💡 タイプ一致なら1.5倍
                    )
                    if m.get("power") is not None else 0
                )
            )
            for m in raw_moves if m.get("move_name") is not None
        ]
        
        # 2.タイプごとの最大値を集計する
        max_atk_by_type = {}
        for move in actual_season_moves:
            m_type = move.move_type
            m_val = move.power_times_atk
            
            # まだそのタイプが登録されていない、または現在の記録より高い数値なら更新
            if m_type not in max_atk_by_type or m_val > max_atk_by_type[m_type]:
                max_atk_by_type[m_type] = m_val

        # 💡 6. SeasonPokemonInfo クラスに全てのデータ（rank含む）を流し込む
        detailed_pokemons.append(SeasonPokemonInfo(
            id=poke_id,
            rank=actual_rank,  # 【追加】DBから取った正式な順位
            name=localized_name,
            english_name=english_name,
            types=localized_types,
            abilities=[],
            base_stats=base_stats,
            weight_kg=0.0,
            height_m=0.0,
            moves=[],
            season_moves=actual_season_moves,
            max_power_times_atk_by_type=max_atk_by_type,
            image_url=f"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{poke_id}.png"
        ))

    # 💡 7. フロントエンドに渡す前に、デフォルトで順位の昇順（1位、2位、3位...）に並び替えておく
    detailed_pokemons.sort(key=lambda x: x.rank)
    
    print(detailed_pokemons[0])

    return detailed_pokemons