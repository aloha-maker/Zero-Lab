# backend/schemas/seasons.py
from pydantic import BaseModel
from typing import Optional,List
from datetime import date
from .pokemon import SeasonPokemonInfo

class RuleBase(BaseModel):
    name: str


class RuleResponse(RuleBase):
    id: int

    class Config:
        from_attributes = True


class SeasonBase(BaseModel):
    name: str
    rule_id: Optional[int] = None  # DBにNULLが入りうるためOptionalに変更
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class SeasonResponse(SeasonBase):
    id: int
    rule: Optional[RuleResponse] = None  # 必要に応じてルール詳細を入れ込めるように記述

    class Config:
        from_attributes = True

class TypeVulnerabilityResult(BaseModel):
    defense_type: str        # 防御側のタイプ（例: 「くさ」）
    total_damage_risk: int   # 純粋な相性倍率の合計（100倍）
    physical_risk_index: int # 相性合計 × 物理防御の指数（hp_times_defense）
    special_risk_index: int  # 相性合計 × 特殊防御の指数（hp_times_sp_defense）
    rank: int                # 不利な順位（1位が一番不利）

class MoveAttackIndexResult(BaseModel):
    pokemon_name: str        # ポケモン名（例: 「ガブリアス」）
    move_name: str           # 技名（例: 「げきりん」）
    move_type: str           # タイプ（例: 「ドラゴン」）
    category: str            # カテゴリ（例: 「物理」）
    power_times_atk: int     # 火力指数（例: 23400）

class SeasonPokemonResponse(BaseModel):
    pokemons: List[SeasonPokemonInfo]               # ポケモン詳細一覧
    vulnerable_ranking: List[TypeVulnerabilityResult] # 不利タイプランキング
    top_moves_ranking: List[MoveAttackIndexResult]

