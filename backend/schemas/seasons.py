# backend/schemas/seasons.py
from pydantic import BaseModel
from typing import Optional
from datetime import date


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