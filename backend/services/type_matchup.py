# backend/services/type_matchup.py
from __future__ import annotations

from typing import List, Tuple
from async_lru import alru_cache
from fastapi import HTTPException

from core.supabase import SupabaseClient

@alru_cache(maxsize=36)
async def fetch_type_data(supabase: SupabaseClient, type_name: str) -> dict:
    """DBからタイプ情報と相性情報を取得する"""
    
    # 1. typesテーブルから日本語または英語名でタイプを検索
    response = supabase.table("types").select("id, name_ja, name_en") \
        .or_(f"name_ja.eq.{type_name},name_en.ilike.{type_name}") \
        .limit(1).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail=f"Type not found: {type_name}")

    type_info = response.data[0]
    type_id = type_info["id"]

    # 2. type_efficacies テーブルから、このタイプが「攻撃側」のときの相性倍率を取得
    # ※ Supabaseでリレーションを組んでいる前提
    eff_response = supabase.table("type_efficacies").select(
        "damage_factor, target_type:types!target_type_id(name_ja)"
    ).eq("damage_type_id", type_id).execute()

    # 防御側タイプ名(日本語)をキーに、倍率を保持する辞書を作成
    # 例: {"ほのお": 0.5, "みず": 0.5, "くさ": 2.0, ...}
    damage_relations = {}
    if eff_response.data:
        for eff in eff_response.data:
            target_name = eff.get("target_type", {}).get("name_ja")
            factor = eff.get("damage_factor", 100)
            if target_name:
                damage_relations[target_name] = factor / 100.0 # 200 -> 2.0

    return {
        "id": type_id,
        "name_ja": type_info["name_ja"],
        "name_en": type_info["name_en"],
        "damage_relations": damage_relations
    }

def calculate_multiplier_and_message(type_data: dict, defenders: List[str]) -> Tuple[float, str]:
    """タイプ相性の倍率とメッセージを計算する"""
    damage_relations = type_data.get("damage_relations", {})
    
    multiplier = 1.0
    for defender in defenders:
        # DBから取得した相性辞書に存在すればその倍率を、なければ等倍(1.0)を乗算
        multiplier *= damage_relations.get(defender, 1.0)

    if multiplier > 1.0:
        msg = "効果は ばつぐんだ！"
    elif multiplier < 1.0 and multiplier > 0.0:
        msg = "効果は いまひとつのようだ"
    elif multiplier == 0.0:
        msg = "効果がないようだ…"
    else:
        msg = "等倍ダメージ"

    return multiplier, msg