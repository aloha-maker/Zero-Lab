"""
メガシンカ関連の取得・データ合成サービス。

元の `services/pokemon.py` から以下2関数を切り出した:
- `fetch_all_mega_forms_from_csv`
- `fetch_mega_pokemon_data_from_pokeapi`

切り出しに合わせて以下のバグを修正している:

1. 二重スラッシュURL
   元コード: `f"{POKEAPI_BASE_URL}/pokemon/{form_poke_id}"`
   `POKEAPI_BASE_URL` は既に末尾に `/` を含む(`".../v2/"`)ため、
   実際のリクエストURLが `".../v2//pokemon/..."` という二重スラッシュになっていた。
   多くのサーバーは正規化して通してしまうため気づきにくいが、正しくは
   `f"{POKEAPI_BASE_URL}pokemon/{form_poke_id}"`。

2. 未使用変数 `species_info` の無駄な代入
   元コードでは以下のように `species_info` へ2回代入していたが、1回目の値は
   2回目の代入で完全に上書きされ、一度も参照されていなかった:

       species_info = base_pokemon_dict.get("pokemon_v2_pokemontypes", [{}])[0] \
           .get("pokemon_v2_type", {}) \
           .get("pokemon_v2_typenames", [{}])[0]  # ここは使われていなかった
       species_info = base_pokemon_dict.get("pokemon_v2_pokemonspecy", {})

   1回目の代入を削除した。
"""
from __future__ import annotations

import csv
import io
from typing import Any

import httpx

from .pokemon_common import MEGA_CSV_URL, POKEAPI_BASE_URL, TYPE_ENG_TO_JA

# メガシンカのフォーム接尾辞 → 表示用日本語サフィックスのマッピング。
# 元コードでは if/elif による文字列比較がインラインで書かれていたため辞書化した。
MEGA_SUFFIX_DISPLAY: dict[str, str] = {
    "mega-x": "メガシンカX",
    "mega-y": "メガシンカY",
}
DEFAULT_MEGA_SUFFIX_DISPLAY = "メガシンカ"

# CSV取得用のタイムアウト(他のリクエストより緩やかな15秒としていた元の値を維持)
CSV_FETCH_TIMEOUT = 15.0
MEGA_DETAIL_FETCH_TIMEOUT = 10.0


async def fetch_all_mega_forms_from_csv() -> list[dict[str, Any]]:
    """CSVからメガシンカである行をすべて抽出する。"""
    async with httpx.AsyncClient(timeout=CSV_FETCH_TIMEOUT) as client:
        res = await client.get(MEGA_CSV_URL)
        res.raise_for_status()

        csv_file = io.StringIO(res.text)
        reader = csv.DictReader(csv_file)

        mega_forms = []
        for row in reader:
            if row.get("is_mega") == "1" and "mega" in row.get("form_identifier", ""):
                mega_forms.append(
                    {
                        "form_poke_id": int(row["pokemon_id"]),
                        "identifier": row["identifier"].lower(),
                        "form_suffix": row["form_identifier"].lower(),
                    }
                )
        return mega_forms


def _build_mega_types_graphql(pokemon_json: dict) -> list[dict]:
    """PokeAPIのtypesレスポンスを、GraphQL風のネスト構造に変換する。"""
    mega_types_graphql = []
    for t_info in pokemon_json.get("types", []):
        eng_type = t_info["type"]["name"]
        ja_type = TYPE_ENG_TO_JA.get(eng_type, eng_type)
        mega_types_graphql.append(
            {"pokemon_v2_type": {"pokemon_v2_typenames": [{"name": ja_type}]}}
        )
    return mega_types_graphql


def _build_mega_stats_graphql(pokemon_json: dict, base_pokemon_dict: dict) -> list[dict]:
    """
    PokeAPIのstatsレスポンスから、GraphQL風のステータス構造を組み立てる。
    HPはメガシンカしても変化しないため、元の通常フォームのHPをそのまま引き継ぐ。
    """
    stats_map = {s["stat"]["name"]: s["base_stat"] for s in pokemon_json.get("stats", [])}

    hp_val = stats_map.get("hp", 0)
    for stat in base_pokemon_dict.get("pokemon_v2_pokemonstats", []):
        if stat.get("pokemon_v2_stat", {}).get("name") == "hp":
            hp_val = stat.get("base_stat", hp_val)
            break

    return [
        {"base_stat": hp_val, "pokemon_v2_stat": {"name": "hp"}},
        {"base_stat": stats_map.get("attack", 0), "pokemon_v2_stat": {"name": "attack"}},
        {"base_stat": stats_map.get("defense", 0), "pokemon_v2_stat": {"name": "defense"}},
        {
            "base_stat": stats_map.get("special-attack", 0),
            "pokemon_v2_stat": {"name": "special-attack"},
        },
        {
            "base_stat": stats_map.get("special-defense", 0),
            "pokemon_v2_stat": {"name": "special-defense"},
        },
        {"base_stat": stats_map.get("speed", 0), "pokemon_v2_stat": {"name": "speed"}},
    ]


def _build_mega_japanese_name(base_pokemon_dict: dict, form_suffix: str) -> str:
    """『タブンネ』→『タブンネ (メガシンカ)』のような表示名を組み立てる。"""
    species_info = base_pokemon_dict.get("pokemon_v2_pokemonspecy", {})
    names_list = species_info.get("pokemon_v2_pokemonspeciesnames", [])
    base_ja_name = names_list[0]["name"] if names_list else base_pokemon_dict.get("name", "不明")

    suffix_display = MEGA_SUFFIX_DISPLAY.get(form_suffix, DEFAULT_MEGA_SUFFIX_DISPLAY)
    return f"{base_ja_name} ({suffix_display})"


async def fetch_mega_pokemon_data_from_pokeapi(
    base_pokemon_dict: dict[str, Any],
    form_poke_id: int,
    form_suffix: str,
) -> dict[str, Any]:
    """
    元のGraphQL辞書構造を保ったまま、タイプと種族値をメガシンカ後のデータに
    上書きした新しい辞書オブジェクトを生成して返却する。

    後続処理(pokemon_season.py の整形ロジック)が「GraphQLレスポンスの生辞書」
    という前提でアクセスするため、ここで模倣した構造を作って合流させている。
    """
    async with httpx.AsyncClient(timeout=MEGA_DETAIL_FETCH_TIMEOUT) as client:
        # 修正: 末尾スラッシュの重複を避けるため "/pokemon/" ではなく "pokemon/" を連結する
        response = await client.get(f"{POKEAPI_BASE_URL}pokemon/{form_poke_id}")
        response.raise_for_status()
        data = response.json()

    mega_types_graphql = _build_mega_types_graphql(data)
    mega_stats_graphql = _build_mega_stats_graphql(data, base_pokemon_dict)
    mega_name_ja = _build_mega_japanese_name(base_pokemon_dict, form_suffix)

    return {
        "id": form_poke_id,
        "name": data.get("name", base_pokemon_dict.get("name")),
        "pokemon_v2_pokemonspecy": {
            "pokemon_v2_pokemonspeciesnames": [{"name": mega_name_ja}]
        },
        "pokemon_v2_pokemontypes": mega_types_graphql,
        "pokemon_v2_pokemonstats": mega_stats_graphql,
        "season_moves": base_pokemon_dict.get("season_moves", []),
        "type_efficacies": base_pokemon_dict.get("type_efficacies", {}),
    }