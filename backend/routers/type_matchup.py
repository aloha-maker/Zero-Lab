from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import httpx

router = APIRouter()

POKEAPI_TYPE_URL = "https://pokeapi.co/api/v2/type/"

# 高可用性・パフォーマンス確保のためのインメモリキャッシュ
# （ポケモンのタイプ相性は不変なため、一度PokeAPIから取得したら使い回す）
TYPE_CACHE = {}

class TypeMatchupRequest(BaseModel):
    attacker_type: str
    defender_types: List[str]

class TypeMatchupResponse(BaseModel):
    multiplier: float
    message: str

async def fetch_type_data(type_name: str) -> dict:
    """PokeAPIからタイプ情報を取得する（キャッシュ優先）"""
    if type_name in TYPE_CACHE:
        return TYPE_CACHE[type_name]
    
    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(f"{POKEAPI_TYPE_URL}{type_name.lower()}")
            res.raise_for_status()
            data = res.json()
            TYPE_CACHE[type_name] = data  # キャッシュに保存
            return data
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=404, detail=f"タイプ '{type_name}' が見つかりません。")
        except Exception as e:
            raise HTTPException(status_code=500, detail="PokeAPIからのデータ取得に失敗しました。")

@router.post("/api/type-matchup", response_model=TypeMatchupResponse)
async def calculate_matchup(req: TypeMatchupRequest):
    attacker = req.attacker_type.lower()
    # 空文字を除外して防御側のタイプリストを作成
    defenders = [t.lower() for t in req.defender_types if t]

    if not defenders:
        raise HTTPException(status_code=400, detail="防御側のタイプを少なくとも1つ指定してください。")

    type_data = await fetch_type_data(attacker)
    damage_relations = type_data.get("damage_relations", {})

    # PokeAPIのレスポンスから、攻撃側から見た倍率リストを抽出
    double_damage_to = [t["name"] for t in damage_relations.get("double_damage_to", [])]
    half_damage_to = [t["name"] for t in damage_relations.get("half_damage_to", [])]
    no_damage_to = [t["name"] for t in damage_relations.get("no_damage_to", [])]

    multiplier = 1.0

    # 防御側の各タイプに対して倍率を掛け合わせる
    for defender in defenders:
        if defender in double_damage_to:
            multiplier *= 2.0
        elif defender in half_damage_to:
            multiplier *= 0.5
        elif defender in no_damage_to:
            multiplier *= 0.0

    # フロントエンド表示用のメッセージ生成
    if multiplier > 1.0:
        msg = "効果は ばつぐんだ！"
    elif multiplier < 1.0 and multiplier > 0.0:
        msg = "効果は いまひとつのようだ"
    elif multiplier == 0.0:
        msg = "効果がないようだ…"
    else:
        msg = "等倍ダメージ"

    return TypeMatchupResponse(multiplier=multiplier, message=msg)