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
    total_damage_risk: int   # 50位までのポケモンから受ける総ダメージリスク値
    rank: int                # 不利な順位（1位が一番不利）

class SeasonPokemonResponse(BaseModel):
    pokemons: List[SeasonPokemonInfo]               # ポケモン詳細一覧
    vulnerable_ranking: List[TypeVulnerabilityResult] # 不利タイプランキング