"""
ポケモン関連サービス群で共有する定数・ヘルパー関数。

- PokeAPI / PokeAPI GraphQL のエンドポイント定義
- タイプ名・ダメージクラス名の英日マッピング
- 日本語名からPokeAPI IDを逆引きする処理
- names配列から指定言語の表示名を取り出す処理

これらは pokemon_detail.py / pokemon_list.py / pokemon_mega.py / pokemon_season.py
の複数箇所から参照されるため、重複定義を避けるために集約している。
"""
from __future__ import annotations

import httpx
from fastapi import HTTPException

POKEAPI_BASE_URL = "https://pokeapi.co/api/v2/"
POKEAPI_GRAPHQL_URL = "https://beta.pokeapi.co/graphql/v1beta"
MEGA_CSV_URL = (
    "https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/pokemon_forms.csv"
)

# GraphQL側で日本語(ja-Hrkt)を表す language_id。
# PokeAPI GraphQLスキーマ上の固定値であり、将来変わる想定はないが、
# マジックナンバーとして複数箇所に直接書かれていたため定数化した。
JAPANESE_LANGUAGE_ID = 11

# httpxの共通タイムアウト・コネクション上限。
# 個々のリクエストの特性によって上書きしたい場合は呼び出し側で別途指定する。
DEFAULT_TIMEOUT = httpx.Timeout(20.0, connect=10.0)
DEFAULT_LIMITS = httpx.Limits(max_keepalive_connections=20, max_connections=50)

# 英語タイプ名 → 日本語タイプ名
TYPE_ENG_TO_JA: dict[str, str] = {
    "normal": "ノーマル",
    "fire": "ほのお",
    "water": "みず",
    "electric": "でんき",
    "grass": "くさ",
    "ice": "こおり",
    "fighting": "かくとう",
    "poison": "どく",
    "ground": "じめん",
    "flying": "ひこう",
    "psychic": "エスパー",
    "bug": "むし",
    "rock": "いわ",
    "ghost": "ゴースト",
    "dragon": "ドラゴン",
    "dark": "あく",
    "steel": "はがね",
    "fairy": "フェアリー",
}

# 全18タイプの英語名リスト(ループ処理用)。TYPE_ENG_TO_JA の定義順に依存する。
ALL_POKEAPI_TYPES: list[str] = list(TYPE_ENG_TO_JA.keys())

# 英語ダメージクラス名 → 日本語表記
DAMAGE_CLASS_ENG_TO_JA: dict[str, str] = {
    "physical": "物理",
    "special": "特殊",
    "status": "変化",
}

# PokeAPIのstat名 → このアプリ内部で使うキー名
STAT_NAME_MAP: dict[str, str] = {
    "hp": "hp",
    "attack": "attack",
    "defense": "defense",
    "special-attack": "sp_attack",
    "special-defense": "sp_defense",
    "speed": "speed",
}


def get_localized_name(names_list: list, target_lang: str, default_name: str) -> str:
    """
    PokeAPIの `names` 配列(言語ごとの表示名リスト)から、指定言語の名前を取り出す。
    該当する言語が見つからない場合は default_name を返す。
    """
    target_lang_lower = target_lang.lower()
    for name_entry in names_list:
        if name_entry["language"]["name"].lower() == target_lang_lower:
            return name_entry["name"]
    return default_name


async def resolve_pokemon_id_by_japanese_name(japanese_name: str) -> int:
    """
    日本語のポケモン名からPokeAPIのIDを逆引きする(GraphQLを使用)。

    注意: 呼び出し側では「クエリ文字列がASCIIでない場合は日本語名とみなす」
    という判定を行っている。全角記号など日本語以外の非ASCII文字が来た場合も
    ここに到達するが、その場合はGraphQL側で該当データが見つからず404になる
    (誤った挙動ではないが、エラーメッセージは「見つかりません」のみになる)。
    """
    graphql_query = {
        "query": """
        query getPokemonIdByJapaneseName($name: String!) {
          pokemon_v2_pokemonspeciesname(where: {name: {_eq: $name}, pokemon_v2_language: {name: {_eq: "ja-Hrkt"}}}) {
            pokemon_species_id
          }
        }
        """,
        "variables": {"name": japanese_name},
    }

    async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
        try:
            res = await client.post(POKEAPI_GRAPHQL_URL, json=graphql_query)
            res.raise_for_status()
            data = res.json()

            results = data.get("data", {}).get("pokemon_v2_pokemonspeciesname", [])
            if not results:
                raise HTTPException(
                    status_code=404,
                    detail=f"'{japanese_name}' というポケモンは見つかりませんでした。",
                )

            return results[0]["pokemon_species_id"]

        except httpx.HTTPStatusError:
            raise HTTPException(status_code=502, detail="PokeAPI GraphQLエラー")
        except httpx.RequestError as exc:
            raise HTTPException(
                status_code=503, detail=f"PokeAPIサーバーに接続できません: {exc}"
            )