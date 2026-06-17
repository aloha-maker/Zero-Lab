from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class ActionOrder(str, Enum):
    FIRST = "先攻"
    SECOND = "後攻"

class AdvantageJudgment(str, Enum):
    EXCELLENT = "◎"
    GOOD = "◯"
    FAIR = "△"
    BAD = "×"

class DisadvantageCategory(str, Enum):
    A = "A：速度負け"
    B = "B：行動保障潰し"
    C = "C：数値受け"
    D = "D：機能停止"

class MatchupInput(BaseModel):
    opponent_rank: int
    opponent_name: str
    action_order: ActionOrder
    my_turns_to_kill: int
    opp_turns_to_kill: int
    has_status_move_threat: Optional[bool] = False
    has_countermeasure: Optional[bool] = False
    is_completely_stopped: Optional[bool] = False

class MatrixCalculationRequest(BaseModel):
    main_pokemon_name: str
    matchups: List[MatchupInput]

class MatrixResultRow(BaseModel):
    opponent_rank: int
    opponent_name: str
    judgment: AdvantageJudgment
    reason_category: Optional[DisadvantageCategory] = None

class MatrixResponse(BaseModel):
    main_pokemon_name: str
    matrix: List[MatrixResultRow]

class PokemonEVs(BaseModel):
    H: int = Field(0, ge=0, le=32)
    A: int = Field(0, ge=0, le=32)
    B: int = Field(0, ge=0, le=32)
    C: int = Field(0, ge=0, le=32)
    D: int = Field(0, ge=0, le=32)
    S: int = Field(0, ge=0, le=32)

class AutoMatrixRequest(BaseModel):
    main_pokemon_name: str = Field(..., description="主軸ポケモン名", example="ガブリアス")
    evs: PokemonEVs