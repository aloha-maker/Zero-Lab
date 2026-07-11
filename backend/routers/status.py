# ルーター定義ファイル
from fastapi import APIRouter
from schemas.status import StatusRequest, StatusResponse
from services.status import calculate_real_status

router = APIRouter()

@router.post("/", response_model=StatusResponse)
def calculate_status(req: StatusRequest):
    """
    ポケモンの実数値を計算するエンドポイント
    """
    real_stat = calculate_real_status(
        is_hp=req.is_hp,
        base_stat=req.base_stat,
        iv=req.iv,
        ev=req.ev,
        level=req.level,
        nature_name=req.nature_name,
        stat_key=req.stat_key
    )
        
    return {"real_stat": real_stat}