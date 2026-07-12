# backend/schemas/type_matchup.py
from pydantic import BaseModel
from typing import List

# ==========================================
# 既存の攻撃相性計算用スキーマ
# ==========================================
class TypeMatchupRequest(BaseModel):
    attacker_type: str #[cite: 2]
    defender_types: List[str] #[cite: 2]

class TypeMatchupResponse(BaseModel):
    multiplier: float #[cite: 2]
    message: str #[cite: 2]

# ==========================================
# 新規：相性補完ポケモン算出用スキーマ
# ==========================================
class ComplementaryPokemon(BaseModel):
    """補完枠として提案されるポケモンの情報"""
    id: int
    name: str
    types: List[str]  # 例: ["ほのお", "ひこう"]
    rank: int         # pokemon_rankings に基づく使用率順位

class ComplementaryResponse(BaseModel):
    """相性補完APIのレスポンス全体"""
    base_pokemon_id: int
    base_weaknesses: List[int]             # 主軸ポケモンの弱点タイプIDリスト
    complements: List[ComplementaryPokemon] # 弱点が被らない候補のリスト