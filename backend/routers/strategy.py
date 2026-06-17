import traceback
from fastapi import APIRouter, HTTPException
from schemas.strategy import AutoMatrixRequest, MatrixResponse
from services.strategy import MatrixService

router = APIRouter()

@router.post("/matrix", response_model=MatrixResponse, summary="努力値ベースの有利不利マトリクス自動計算実行")
async def create_matrix(request: AutoMatrixRequest): # ★ async を付与
    try:
        return await MatrixService.generate_auto_matrix(request)
    except Exception as e:
        import traceback
        traceback.print_exc() # 開発用にコンソールに詳細ログを残す
        raise HTTPException(status_code=500, detail=f"自動計算エラー: {str(e)}")