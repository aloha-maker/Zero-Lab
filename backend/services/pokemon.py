import httpx
import os
import csv
import io
import asyncio
from typing import List, Dict, Any
from fastapi import HTTPException
from async_lru import alru_cache
from schemas.pokemon import PokemonInfo, PokemonListItem,SeasonPokemonInfo,SeasonMoveInfo,PokemonMoveDetail
from .type_matchup import fetch_type_data, calculate_multiplier_and_message
from core.config import settings

POKEAPI_BASE_URL = "https://pokeapi.co/api/v2/"
POKEAPI_GRAPHQL_URL = "https://beta.pokeapi.co/graphql/v1beta"
MEGA_CSV_URL = "https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/pokemon_forms.csv"

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

timeout = httpx.Timeout(20.0, connect=10.0)
limits = httpx.Limits(max_keepalive_connections=20, max_connections=50)

# 全18タイプの英語名リスト（PokeAPIの仕様に準拠）
ALL_POKEAPI_TYPES = [
    "normal", "fire", "water", "electric", "grass", "ice", 
    "fighting", "poison", "ground", "flying", "psychic", "bug", 
    "rock", "ghost", "dragon", "dark", "steel", "fairy"
]

# 💡 英語のタイプ名から日本語名へ変換するマッピング辞書
TYPE_ENG_TO_JA = {
    "normal": "ノーマル", "fire": "ほのお", "water": "みず", 
    "electric": "でんき", "grass": "くさ", "ice": "こおり", 
    "fighting": "かくとう", "poison": "どく", "ground": "じめん", 
    "flying": "ひこう", "psychic": "エスパー", "bug": "むし", 
    "rock": "いわ", "ghost": "ゴースト", "dragon": "ドラゴン", 
    "dark": "あく", "steel": "はがね", "fairy": "フェアリー"
}

# 全18タイプの英語名リスト（ループ用）
ALL_POKEAPI_TYPES = list(TYPE_ENG_TO_JA.keys())

DAMAGE_CLASS_ENG_TO_JA = {
    "physical": "物理",
    "special": "特殊",
    "status": "変化"
}

async def resolve_pokemon_id_by_japanese_name(japanese_name: str) -> int:
    """日本語のポケモン名からPokeAPIのIDを逆引きする(GraphQLを使用)"""
    # GraphQLのクエリ：pokemon_v2_pokemonspeciesname から日本語名を検索
    graphql_query = {
        "query": """
        query getPokemonIdByJapaneseName($name: String!) {
          pokemon_v2_pokemonspeciesname(where: {name: {_eq: $name}, pokemon_v2_language: {name: {_eq: "ja-Hrkt"}}}) {
            pokemon_species_id
          }
        }
        """,
        "variables": {"name": japanese_name}
    }

    async with httpx.AsyncClient(timeout=timeout) as client:
        try:
            res = await client.post(POKEAPI_GRAPHQL_URL, json=graphql_query)
            res.raise_for_status()
            data = res.json()
            
            # 該当するデータがあるかチェック
            results = data.get("data", {}).get("pokemon_v2_pokemonspeciesname", [])
            if not results:
                raise HTTPException(status_code=404, detail=f"'{japanese_name}' というポケモンは見つかりませんでした。")
                
            return results[0]["pokemon_species_id"]
            
        except httpx.HTTPStatusError as exc:
            raise HTTPException(status_code=exc.response.status_code, detail="PokeAPI GraphQLエラー")
        except httpx.RequestError as exc:
            raise HTTPException(status_code=503, detail=f"PokeAPIサーバーに接続できません: {exc}")

def get_localized_name(names_list: list, target_lang: str, default_name: str) -> str:
    target_lang_lower = target_lang.lower()
    for name_entry in names_list:
        if name_entry["language"]["name"].lower() == target_lang_lower:
            return name_entry["name"]
    return default_name


@alru_cache(maxsize=256)
async def fetch_pokemon_data(name_or_id: str) -> PokemonInfo:
    """ポケモン詳細情報を取得する"""
    lang = settings.TARGET_LANGUAGE
    query = str(name_or_id).lower().strip()

    if not query.isdigit() and not query.isascii():
        poke_id = await resolve_pokemon_id_by_japanese_name(name_or_id)
        query = str(poke_id)

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
        
        # 技のURLリストを取得
        move_entries = pokemon_data.get("moves", [])
        move_urls = [m["move"]["url"] for m in move_entries]

        species_url = f"{POKEAPI_BASE_URL}pokemon-species/{poke_id}"
        type_urls = [t["type"]["url"] for t in pokemon_data.get("types", [])]
        ability_urls = [a["ability"]["url"] for a in pokemon_data.get("abilities", [])]

        # 並行リクエストの組み立て
        requests = [client.get(species_url)] + \
                   [client.get(url) for url in type_urls] + \
                   [client.get(url) for url in ability_urls] + \
                   [client.get(url) for url in move_urls]

        try:
            responses = await asyncio.gather(*requests)
        except httpx.RequestError as exc:
            raise HTTPException(status_code=503, detail=f"PokeAPIサーバー(詳細データ)に接続できません: {exc}")

        # レレスポンスの切り分け
        species_res = responses[0]
        type_responses = responses[1:1 + len(type_urls)]
        ability_responses = responses[1 + len(type_urls):1 + len(type_urls) + len(ability_urls)]
        move_responses = responses[1 + len(type_urls) + len(ability_urls):]

        localized_name = base_name
        english_name = base_name
        localized_types = []
        localized_abilities = []
        localized_moves = []  # 💡 ここに構造化した技情報を入れていきます

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

        # 💡 技の詳細情報を解析して新しい型に当てはめる
        for move_res in move_responses:
            if move_res.status_code == 200:
                m_data = move_res.json()
                
                # 1. 技の日本語名
                m_name = get_localized_name(m_data.get("names", []), lang, m_data.get("name"))
                
                # 2. 技のタイプ（英語から日本語へマッピング。なければ英語のまま）
                m_type_eng = m_data.get("type", {}).get("name", "")
                m_type_ja = TYPE_ENG_TO_JA.get(m_type_eng, m_type_eng)
                
                # 3. 命中率
                m_power = m_data.get("power")
                m_accuracy = m_data.get("accuracy")  # int または None
                
                # 4. カテゴリ（ぶつり/特殊/変化）
                m_class_eng = m_data.get("damage_class", {}).get("name", "")
                m_class_ja = DAMAGE_CLASS_ENG_TO_JA.get(m_class_eng, m_class_eng)
                
                # 💡 新しいモデルの形にしてリストに追加
                localized_moves.append(
                    PokemonMoveDetail(
                        name=m_name,
                        type=m_type_ja,
                        power=m_power,
                        accuracy=m_accuracy,
                        damage_class=m_class_ja
                    )
                )

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
            moves=localized_moves,  # Pydanticが自動でList[PokemonMoveDetail]にパースしてくれます
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

async def fetch_all_mega_forms_from_csv() -> List[Dict[str, Any]]:
    """CSVからメガシンカである行をすべて抽出する"""
    async with httpx.AsyncClient(timeout=15.0) as client:
        res = await client.get(MEGA_CSV_URL)
        res.raise_for_status()
        
        csv_file = io.StringIO(res.text)
        reader = csv.DictReader(csv_file)
        
        mega_forms = []
        for row in reader:
            if row.get("is_mega") == "1" and "mega" in row.get("form_identifier", ""):
                mega_forms.append({
                    "form_poke_id": int(row["pokemon_id"]),
                    "identifier": row["identifier"].lower(),
                    "form_suffix": row["form_identifier"].lower()
                })
        return mega_forms

async def fetch_mega_pokemon_data_from_pokeapi(
    base_pokemon_dict: Dict[str, Any], 
    form_poke_id: int, 
    form_suffix: str
) -> Dict[str, Any]:
    """
    【GraphQL辞書構造 模倣版】
    元のGraphQL辞書構造を完全に保ったまま、タイプと種族値をメガシンカ後のデータに上書きした
    新しい辞書オブジェクトを生成して返却する。
    """
    async with httpx.AsyncClient(timeout=10.0) as client:
        # PokeAPIからメガシンカの姿のデータを直接取得
        response = await client.get(f"{POKEAPI_BASE_URL}/pokemon/{form_poke_id}")
        response.raise_for_status()
        data = response.json()
        
        # 1. メガシンカ後のタイプ構造を、元のGraphQLのネスト構造に合わせて組み立て
        mega_types_graphql = []
        for t_info in data.get("types", []):
            eng_type = t_info["type"]["name"]
            ja_type = TYPE_ENG_TO_JA.get(eng_type, eng_type)
            mega_types_graphql.append({
                "pokemon_v2_type": {
                    "pokemon_v2_typenames": [{"name": ja_type}]
                }
            })
            
        # 2. メガシンカ後の種族値構造を組み立て
        stats_map = {}
        for s_info in data.get("stats", []):
            stats_map[s_info["stat"]["name"]] = s_info["base_stat"]
            
        # メガシンカしてもHP種族値は元のポケモンと同じ
        hp_val = stats_map.get("hp", 0)
        # 元の辞書からHPを引っ張る
        for stat in base_pokemon_dict.get("pokemon_v2_pokemonstats", []):
            if stat.get("pokemon_v2_stat", {}).get("name") == "hp":
                hp_val = stat.get("base_stat", hp_val)
                break

        mega_stats_graphql = [
            {"base_stat": hp_val, "pokemon_v2_stat": {"name": "hp"}},
            {"base_stat": stats_map.get("attack", 0), "pokemon_v2_stat": {"name": "attack"}},
            {"base_stat": stats_map.get("defense", 0), "pokemon_v2_stat": {"name": "defense"}},
            {"base_stat": stats_map.get("special-attack", 0), "pokemon_v2_stat": {"name": "special-attack"}},
            {"base_stat": stats_map.get("special-defense", 0), "pokemon_v2_stat": {"name": "special-defense"}},
            {"base_stat": stats_map.get("speed", 0), "pokemon_v2_stat": {"name": "speed"}},
        ]

        # 3. 日本語名の整形 (タブンネ ➡ タブンネ (メガシンカ))
        species_info = base_pokemon_dict.get("pokemon_v2_pokemontypes", [{}])[0] \
            .get("pokemon_v2_type", {}) \
            .get("pokemon_v2_typenames", [{}])[0] # 暫定のフォールバック用
            
        species_info = base_pokemon_dict.get("pokemon_v2_pokemonspecy", {})
        names_list = species_info.get("pokemon_v2_pokemonspeciesnames", [])
        base_ja_name = names_list[0]["name"] if names_list else base_pokemon_dict.get("name", "不明")
        
        suffix_display = "メガシンカ"
        if form_suffix == "mega-x":
            suffix_display = "メガシンカX"
        elif form_suffix == "mega-y":
            suffix_display = "メガシンカY"
            
        mega_name_ja = f"{base_ja_name} ({suffix_display})"

        # 4. 新しいGraphQL風の辞書を生成して返却
        return {
            "id": form_poke_id,
            "name": data.get("name", base_pokemon_dict.get("name")),
            "pokemon_v2_pokemonspecy": {
                "pokemon_v2_pokemonspeciesnames": [{"name": mega_name_ja}]
            },
            "pokemon_v2_pokemontypes": mega_types_graphql,
            "pokemon_v2_pokemonstats": mega_stats_graphql,
            "season_moves": base_pokemon_dict.get("season_moves", []),
            "type_efficacies": base_pokemon_dict.get("type_efficacies", {})
        }

async def get_active_season_pokemon_details() -> List[SeasonPokemonInfo]:
    """
    【完全修正・一元パース版】
    通常ポケモンとメガシンカポケモンをすべて生辞書(dict)のレイヤーで合流させ、
    後半の巨大な成形処理を1つの共通ロジックで安全に通過させます。
    """
    from supabase import create_client
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    # 1. Supabaseから環境ポケモンと技データを取得
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
        .order("rank", desc=False)
        .execute()
    )

    if not res.data:
        return []

    pokemon_rank_map = {}
    pokemon_moves_map = {}
    pokemon_ids = []
    
    for row in res.data:
        rank_value = row.get("rank")
        mapping_list = row.get("pokemon_battle_db_mapping")
        moves_list = row.get("pokemon_moves_rankings", [])
        
        if mapping_list and isinstance(mapping_list, list) and len(mapping_list) > 0:
            mapping_data = mapping_list[0]
            if "poke_api_id" in mapping_data and mapping_data["poke_api_id"] is not None:
                api_id = int(mapping_data["poke_api_id"])
                pokemon_ids.append(api_id)
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

    # 2. 20匹ずつのグループに分割してGraphQLからデータ並列取得
    chunk_size = 20
    chunks = [pokemon_ids[i:i + chunk_size] for i in range(0, len(pokemon_ids), chunk_size)]

    raw_pokemons = []
    async with httpx.AsyncClient(timeout=timeout, limits=limits) as client:
        tasks = [_fetch_chunk_from_graphql(client, chunk) for chunk in chunks]
        results = await asyncio.gather(*tasks)
        for result_list in results:
            raw_pokemons.extend(result_list)
    
    # 3. メガシンカCSVマッピングを取得し、生辞書の段階でリストを拡張する
    mega_forms = await fetch_all_mega_forms_from_csv()
    
    # 💡 すべてを共通の「生辞書(dict)」として扱うための統合リスト
    all_raw_pokemon_dicts: List[Dict[str, Any]] = []
    
    for p_dict in raw_pokemons:
        # まず通常のポケモン生辞書を追加
        all_raw_pokemon_dicts.append(p_dict)
        
        base_eng_name = p_dict.get("name", "").lower()
        if not base_eng_name:
            continue
            
        matched_megas = [m for m in mega_forms if base_eng_name in m["identifier"]]
        
        for mega_info in matched_megas:
            try:
                # 前回作成した関数で、GraphQL構造を模倣したメガの「生辞書」を取得
                mega_pokemon_dict = await fetch_mega_pokemon_data_from_pokeapi(
                    base_pokemon_dict=p_dict,
                    form_poke_id=mega_info["form_poke_id"],
                    form_suffix=mega_info["form_suffix"]
                )
                
                # 💡 メガシンカ用IDに対しても、元の通常ポケモンの順位と技データをマッピングに登録・継承させる
                mega_id = mega_pokemon_dict["id"]
                base_id = p_dict["id"]
                pokemon_rank_map[mega_id] = pokemon_rank_map.get(base_id, 999)
                pokemon_moves_map[mega_id] = pokemon_moves_map.get(base_id, [])
                
                # 生辞書のまま統合リストへ追加
                all_raw_pokemon_dicts.append(mega_pokemon_dict)
                
            except Exception as e:
                print(f"メガシンカ生辞書の構築に失敗しました ({mega_info['identifier']}): {e}")
                continue

    # 4. 全タイプの相性データを一斉に並列取得（ループの外に出すことで劇的な高速化）
    type_data_tasks = [fetch_type_data(t_name) for t_name in ALL_POKEAPI_TYPES]
    type_data_results = await asyncio.gather(*type_data_tasks)
    type_data_map = dict(zip(ALL_POKEAPI_TYPES, type_data_results))

    # 5. 統合された生辞書リストを、一連の共通成形ロジックで安全に処理する
    detailed_pokemons: list[SeasonPokemonInfo] = []
    
    for p in all_raw_pokemon_dicts:
        # 💡 共通して辞書型(dict)として安全にアクセス可能
        poke_id = p["id"]
        english_name = p.get("name", "")
        
        actual_rank = pokemon_rank_map.get(poke_id, 999)

        # 日本語名・タイプ・種族値の成形
        ja_names = p.get("pokemon_v2_pokemonspecy", {}).get("pokemon_v2_pokemonspeciesnames", [])
        localized_name = ja_names[0]["name"] if ja_names else english_name

        localized_types = []
        english_types = []
        
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

        # 種族値パース
        base_stats = {}
        hp_val = 0
        defense_val = 0
        sp_defense_val = 0
        attack_val = 0
        sp_attack_val = 0

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
            
            if mapped_name == "hp": hp_val = val
            elif mapped_name == "defense": defense_val = val
            elif mapped_name == "sp_defense": sp_defense_val = val
            elif mapped_name == "attack": attack_val = val
            elif mapped_name == "sp_attack": sp_attack_val = val

        base_stats["hp_times_defense"] = hp_val * defense_val
        base_stats["hp_times_sp_defense"] = hp_val * sp_defense_val
        
        # 技の火力指数計算（通常・メガ共通で、タイプ一致1.5倍も正確に適用されます）
        raw_moves = pokemon_moves_map.get(poke_id, [])
        actual_season_moves = [
            SeasonMoveInfo(
                move_name=m.get("move_name"),
                move_type=m.get("move_type"),
                category=m.get("category"),
                power=m.get("power"),
                power_times_atk=(
                    int(
                        m.get("power") * (attack_val if m.get("category") == "物理" else sp_attack_val) * (1.5 if m.get("move_type") in localized_types else 1.0)
                    )
                    if m.get("power") is not None else 0
                )
            )
            for m in raw_moves if m.get("move_name") is not None
        ]
        
        max_atk_by_type = {}
        for move in actual_season_moves:
            m_type = move.move_type
            m_val = move.power_times_atk
            if m_type not in max_atk_by_type or m_val > max_atk_by_type[m_type]:
                max_atk_by_type[m_type] = m_val
        
        # 💡 事前に外で一斉取得しておいたタイプデータを使用して相性をマッピング（劇的に高速化）
        pokemon_type_efficacies = {}
        for t_name in ALL_POKEAPI_TYPES:
            t_data = type_data_map[t_name]
            multiplier, _ = calculate_multiplier_and_message(t_data, defenders=english_types)
            ja_type_name = TYPE_ENG_TO_JA.get(t_name, t_name)
            pokemon_type_efficacies[ja_type_name] = multiplier
            pokemon_type_efficacies[t_name] = multiplier

        # 6. 最後に一括で正規の Pydantic モデルへ変換
        detailed_pokemons.append(SeasonPokemonInfo(
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
            season_moves=actual_season_moves,
            max_power_times_atk_by_type=max_atk_by_type,
            type_efficacies=pokemon_type_efficacies,
            image_url=f"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{poke_id}.png"
        ))

    # 7. フロントエンドのために順位順に並び替え
    detailed_pokemons.sort(key=lambda x: x.rank)

    return detailed_pokemons