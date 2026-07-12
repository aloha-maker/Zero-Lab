import traceback
from fastapi import APIRouter, HTTPException,Depends
from core.supabase import get_supabase, SupabaseClient
from schemas.strategy import AutoMatrixRequest, MatrixResponse
from services.strategy import MatrixService
from schemas.evaluate_1v1_matchup import Step2Request, Step2Response
from services.evaluate_1v1_matchup import execute_step2_filtering

router = APIRouter()

@router.post("/matrix", response_model=MatrixResponse, summary="努力値ベースの有利不利マトリクス自動計算実行")
async def create_matrix(request: AutoMatrixRequest,supabase: SupabaseClient = Depends(get_supabase)):
    try:
        return await MatrixService.generate_auto_matrix(request,supabase)
    except Exception as e:
        import traceback
        traceback.print_exc() # 開発用にコンソールに詳細ログを残す
        raise HTTPException(status_code=500, detail=f"自動計算エラー: {str(e)}")

@router.post("/step2-filter", response_model=Step2Response, summary="Step 2: 相性補完フィルタリング")
async def filter_step2_candidates(
    request: Step2Request,
    supabase: SupabaseClient = Depends(get_supabase)
):
    """
    「主軸ポケモンが苦手な敵（△・×）」のリストと、「Step 1の候補ポケモン」のリストを受け取り、
    1対1の相性判定を行います。
    敵全員に対して「△」または「×」しか取れない候補を除外し、生き残ったポケモンのリストを返します。
    """
    try:
        return await execute_step2_filtering(request, supabase)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Step 2 フィルタリングエラー: {str(e)}")