from pydantic import BaseModel, Field
from typing import Dict,List, Optional
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


# ---------------------------------------------------------------------------
# ③ 候補ポケモン一括マトリクス計算（新規追加）
# ---------------------------------------------------------------------------

class BulkMatrixCandidate(BaseModel):
    """
    Step2（相性フィルタ）で絞り込まれた候補ポケモン1体分。
    Step2のレスポンス（FilteredPokemon）の id / name をそのまま流用できる。
    """
    id: int
    name: str = Field(..., description="候補ポケモン名")


class BulkMatrixRequest(BaseModel):
    """
    候補ポケモン群（10〜30体想定）に対して、環境トップ50とのマトリクスを
    一括計算するためのリクエスト。
    各候補の努力値・性格は、使用率1位のもの（top_evs / top_nature）を
    自動採用するため、EVs等の指定は不要。
    """
    candidates: List[BulkMatrixCandidate] = Field(
        ..., description="Step2で絞り込んだ候補ポケモンの一覧"
    )


class CandidateMatrixResult(BaseModel):
    """候補ポケモン1体分の、環境トップ50に対するマトリクス結果"""
    id: int
    name: str
    matrix: List[MatrixResultRow]


class BulkMatrixResponse(BaseModel):
    results: List[CandidateMatrixResult]

class OneVsOneRequest(BaseModel):
    my_pokemon_name: str
    my_evs: Dict[str, int]  # フロントからは {"H": 252, "A": 252, ...} の形式で受け取る
    my_nature: str
    opp_pokemon_name: str

class CombatantDetail(BaseModel):
    speed_real: int
    best_move_name: str
    best_move_type: str
    best_move_power: int
    type_multiplier: float
    turns_to_kill: int

class OneVsOneResponse(BaseModel):
    my_pokemon_name: str
    opp_pokemon_name: str
    action_order: str  # "FIRST" or "SECOND"
    my_detail: CombatantDetail
    opp_detail: CombatantDetail
    judgment: str
    reason_category: Optional[str]