from fastapi import APIRouter
from pydantic import BaseModel
import math

# ルーターの初期化
router = APIRouter()

# フロントエンドから受け取るデータの型定義
class StatusRequest(BaseModel):
    is_hp: bool           # HPかどうかのフラグ（TrueならHPの計算式、Falseならその他の計算式）
    base_stat: int        # 種族値
    iv: int = 31          # 個体値（Individual Value: 0〜31、デフォルトはV）
    ev: int = 0           # 努力値（Effort Value: 0〜252）
    level: int = 50       # レベル
    nature_modifier: float = 1.0 # 性格補正（1.1 = 上昇, 1.0 = 無補正, 0.9 = 下降）

@router.post("/api/calculate")
def calculate_status(req: StatusRequest):
    """
    ポケモンの実数値を計算するエンドポイント
    """
    # 1. 努力値のボーナス計算（4で割って切り捨て）
    ev_bonus = math.trunc(req.ev / 4)
    
    # 2. 共通の基礎計算部分
    # trunc( (種族値×2 + 個体値 + 努力値ボーナス) × レベル ÷ 100 )
    base_calc = math.trunc((req.base_stat * 2 + req.iv + ev_bonus) * req.level / 100)
    
    # 3. HPとそれ以外で計算式を分岐
    if req.is_hp:
        # HPの計算式: 基礎計算 + レベル + 10
        # (※ ヌケニンのような最大HP1の特殊処理は今回は除外しています)
        real_stat = base_calc + req.level + 10
    else:
        # HP以外の計算式: trunc( (基礎計算 + 5) × 性格補正 )
        real_stat = math.trunc((base_calc + 5) * req.nature_modifier)
        
    return {
        "real_stat": real_stat
    }