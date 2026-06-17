import httpx
from typing import List, Tuple

POKEAPI_TYPE_URL = "https://pokeapi.co/api/v2/type/"
TYPE_CACHE = {}

# ★【追加】日本語タイプ名から PokeAPI用の英語タイプ名への変換マップ
JE_TYPE_MAP = {
    "ノーマル": "normal", "ほのお": "fire", "みず": "water", "くさ": "grass",
    "でんき": "electric", "こおり": "ice", "かくとう": "fighting", "どく": "poison",
    "じめん": "ground", "ひこう": "flying", "エスパー": "psychic", "むし": "bug",
    "いわ": "rock", "ゴースト": "ghost", "ドラゴン": "dragon", "あく": "dark",
    "はがね": "steel", "フェアリー": "fairy"
}

async def fetch_type_data(type_name: str) -> dict:
    """PokeAPIからタイプ情報を取得する（キャッシュ優先）"""
    # ★【追加】もし日本語で届いたら英語に変換。マップになければそのまま小文字で利用
    eng_type_name = JE_TYPE_MAP.get(type_name, type_name).lower()
    
    if eng_type_name in TYPE_CACHE:
        return TYPE_CACHE[eng_type_name]
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        # ★ eng_type_name をURLに使うように修正
        res = await client.get(f"{POKEAPI_TYPE_URL}{eng_type_name}")
        res.raise_for_status()
        data = res.json()
        TYPE_CACHE[eng_type_name] = data
        return data

def calculate_multiplier_and_message(type_data: dict, defenders: List[str]) -> Tuple[float, str]:
    """タイプ相性の倍率とメッセージを計算する純粋な関数"""
    damage_relations = type_data.get("damage_relations", {})
    
    double_damage_to = [t["name"] for t in damage_relations.get("double_damage_to", [])]
    half_damage_to = [t["name"] for t in damage_relations.get("half_damage_to", [])]
    no_damage_to = [t["name"] for t in damage_relations.get("no_damage_to", [])]

    multiplier = 1.0
    for defender in defenders:
        if defender in double_damage_to:
            multiplier *= 2.0
        elif defender in half_damage_to:
            multiplier *= 0.5
        elif defender in no_damage_to:
            multiplier *= 0.0

    if multiplier > 1.0:
        msg = "効果は ばつぐんだ！"
    elif multiplier < 1.0 and multiplier > 0.0:
        msg = "効果は いまひとつのようだ"
    elif multiplier == 0.0:
        msg = "効果がないようだ…"
    else:
        msg = "等倍ダメージ"

    return multiplier, msg