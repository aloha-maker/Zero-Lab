import traceback
from fastapi import APIRouter, HTTPException
from schemas.strategy import AutoMatrixRequest, MatrixResponse
from services.strategy import MatrixService

router = APIRouter()

@router.post("/matrix", response_model=MatrixResponse, summary="努力値ベースの有利不利マトリクス自動計算実行")
def create_matrix(request: AutoMatrixRequest):
    try:
        # 新しい自動計算サービスを呼び出す
        return MatrixService.generate_auto_matrix(request)
    except Exception as e:
        # ★ エラーの内容をFastAPI側のコンソールに詳細に吐き出す
        print("======== [CRITICAL ERROR LOG START] ========")
        traceback.print_exc()
        print("======== [CRITICAL ERROR LOG END] ========")
        
        raise HTTPException(
            status_code=500, 
            detail=f"内部エラー発生: {str(e)}"
        )