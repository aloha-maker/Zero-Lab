"""
ポケモン一覧取得サービス。

元の `services/pokemon.py` には以下3つの関数があったが、
- `_fetch_pokemon_list_by_ids` (IDを指定して取得)
- `get_pokemon_list_by_rule` (ルールIDで絞り込んで取得)
- `get_all_pokemon_list` (全件取得)
`get_all_pokemon_list` だけが `_fetch_pokemon_list_by_ids` を使わず、
ほぼ同一のGraphQLクエリ・整形ロジックを独自に持っていた。
このファイルでは整形処理を `_parse_pokemon_list_response` に一本化し、
「IDで絞り込むかどうか」だけをGraphQLクエリの where 句で切り替える設計にしている。

また、Supabaseクライアントは関数内で生成せず、呼び出し側
(ルーター層など)から引数として受け取るDI方式に変更した。
"""
from __future__ import annotations

import httpx
from async_lru import alru_cache
from fastapi import HTTPException

from core.supabase import SupabaseClient
from schemas.pokemon import PokemonListItem

from .pokemon_common import DEFAULT_TIMEOUT, JAPANESE_LANGUAGE_ID, POKEAPI_GRAPHQL_URL

_LIST_QUERY_TEMPLATE = """
query($ids: [Int!]) {{
  pokemon_v2_pokemon(
    where: {where_clause}
    order_by: {{id: asc}}
  ) {{
    id
    name
    pokemon_v2_pokemonspecy {{
      pokemon_v2_pokemonspeciesnames(where: {{language_id: {{_eq: {lang_id}}}}}) {{
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


def _parse_pokemon_list_response(pokemons: list[dict]) -> list[PokemonListItem]:
    """GraphQLレスポンスの pokemon_v2_pokemon 配列を PokemonListItem のリストへ整形する。"""
    items: list[PokemonListItem] = []
    for p in pokemons:
        ja_names = (p.get("pokemon_v2_pokemonspecy") or {}).get(
            "pokemon_v2_pokemonspeciesnames", []
        )
        ja_name = ja_names[0]["name"] if ja_names else p["name"]
        items.append(
            PokemonListItem(
                pokemon_id=p["id"],
                name=ja_name,
                english_name=p["name"],
                image_url=_sprite_url(p["id"]),
            )
        )
    return items


async def _query_pokemon_list(pokemon_ids: list[int] | None) -> list[PokemonListItem]:
    """
    pokemon_ids が指定されていればIN句で絞り込み、None なら全件取得する共通クエリ実行処理。
    """
    where_clause = "{id: {_in: $ids}}" if pokemon_ids is not None else "{}"
    query = _LIST_QUERY_TEMPLATE.format(
        where_clause=where_clause, lang_id=JAPANESE_LANGUAGE_ID
    )
    variables = {"ids": pokemon_ids} if pokemon_ids is not None else {}

    async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
        try:
            res = await client.post(
                POKEAPI_GRAPHQL_URL,
                json={"query": query, "variables": variables},
                headers={"Content-Type": "application/json"},
            )
            res.raise_for_status()
        except httpx.RequestError as exc:
            raise HTTPException(
                status_code=503, detail=f"PokeAPI GraphQLに接続できません: {exc}"
            )

        pokemons = res.json().get("data", {}).get("pokemon_v2_pokemon", [])

    return _parse_pokemon_list_response(pokemons)


async def get_pokemon_list_by_rule(
    rule_id: int, supabase: SupabaseClient
) -> list[PokemonListItem]:
    """
    指定ルールで使用可能なポケモン一覧を返す。
    Supabase から pokemon_id を取得し、GraphQL で日本語名・画像のみ一括取得する。
    """
    res = (
        supabase.table("rule_available_pokemons")
        .select("pokemon_id")
        .eq("rule_id", rule_id)
        .execute()
    )

    if not res.data:
        return []

    pokemon_ids = [row["pokemon_id"] for row in res.data]
    return await _query_pokemon_list(pokemon_ids)


@alru_cache(maxsize=1)
async def get_all_pokemon_list() -> list[PokemonListItem]:
    """
    全ポケモンの一覧を PokeAPI GraphQL から一括取得して返す。
    結果は alru_cache でサーバー起動中メモリにキャッシュする(再起動まで再取得しない)。
    """
    return await _query_pokemon_list(pokemon_ids=None)



# backend/services/pokemon_master.py
"""
サジェスト・マスターデータ一覧取得サービス
"""

from async_lru import alru_cache
from core.supabase import SupabaseClient
from schemas.pokemon import CandidatePokemon

# マスターデータは頻繁に変わらないため、キャッシュを長めに設定
@alru_cache(maxsize=1)
async def fetch_pokemon_candidates(supabase: SupabaseClient) -> list[CandidatePokemon]:
    select_query = (
        "id, form_category, form_name_ja, form_name_en, image_url, "
        "species:pokemon_species!inner(name_ja, name_en)"
    )

    all_data = []
    offset = 0
    limit_size = 1000

    # 1000件の取得上限(Supabaseの仕様)を回避するため、全件取得できるまでループ
    while True:
        response = supabase.table("pokemon").select(select_query) \
            .order("id") \
            .range(offset, offset + limit_size - 1) \
            .execute()
        
        data_chunk = response.data
        if not data_chunk:
            break
            
        all_data.extend(data_chunk)
        
        if len(data_chunk) < limit_size:
            break  # 取得件数がlimit未満なら全件取得完了
            
        offset += limit_size

    candidates = []

    # 先ほど作成した表示名整形ロジックを適用
    for data in all_data:
        species = data.get("species", {})
        form_category = data.get("form_category", "")
        
        base_name_ja = species.get("name_ja", "")
        form_name_ja = data.get("form_name_ja", "")
        
        base_name_en = species.get("name_en", "")
        form_name_en = data.get("form_name_en", "")
        
        # 表示名の決定ロジック
        if form_category == "normal":
            ja_name = base_name_ja
            en_name = base_name_en
        elif form_category == "mega":
            ja_name = form_name_ja if form_name_ja else base_name_ja
            en_name = form_name_en if form_name_en else base_name_en
        else:
            if form_name_ja:
                ja_name = f"{base_name_ja}({form_name_ja})"
            else:
                ja_name = base_name_ja

            if form_name_en:
                en_name = f"{base_name_en} ({form_name_en})"
            else:
                en_name = base_name_en

        candidates.append(
            CandidatePokemon(
                id=data["id"],
                name=en_name,
                jaName=ja_name,
                imageUrl=data.get("image_url")
            )
        )

    return candidates