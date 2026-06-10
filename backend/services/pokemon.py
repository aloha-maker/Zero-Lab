import httpx
import os
import asyncio
from fastapi import HTTPException
from async_lru import alru_cache
from schemas.pokemon import PokemonInfo, PokemonListItem
from core.config import settings

POKEAPI_BASE_URL = "https://pokeapi.co/api/v2/"
POKEAPI_GRAPHQL_URL = "https://beta.pokeapi.co/graphql/v1beta"

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

timeout = httpx.Timeout(30.0, connect=10.0)


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