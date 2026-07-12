# backend/schemas/step2_filter.py
from pydantic import BaseModel
from typing import List, Literal, Optional

# フロントエンドの型定義に合わせたリテラル型
AdvantageJudgment = Literal["◎", "◯", "△", "×"]
DisadvantageCategory = Literal["A：速度負け", "B：行動保障潰し", "C：数値受け", "D：機能停止"]

# Step 1の候補ポケモンのデータ構造
class ComplementaryPokemon(BaseModel):
    id: int
    name: str
    types: List[str]
    rank: int

# 主軸が苦手とする「△×のポケモン」のデータ構造
class MatrixResultRow(BaseModel):
    opponent_rank: int
    opponent_name: str
    judgment: AdvantageJudgment
    reason_category: Optional[DisadvantageCategory] = None

# APIのリクエストボディ
class Step2Request(BaseModel):
    candidates: List[ComplementaryPokemon]
    targets: List[MatrixResultRow]

# APIのレスポンス（除外されずに残ったポケモン）
class FilteredPokemon(ComplementaryPokemon):
    # UIで表示しやすいよう「どの敵に有利(◎/◯)だったか」のリストを持たせる
    good_matchups: List[str]

class Step2Response(BaseModel):
    filtered_candidates: List[FilteredPokemon]