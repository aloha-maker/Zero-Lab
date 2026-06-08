from fastapi import APIRouter, HTTPException
from typing import List
from schemas.seasons import SeasonResponse
from services import seasons as seasons_service

router = APIRouter(tags=["seasons"])


@router.get("/", response_model=List[SeasonResponse])
async def get_seasons():
    """
    シーズン一覧を取得する。
    レスポンスには各シーズンに紐づく rule_id を含む。
    """
    try:
        return seasons_service.get_all_seasons()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"シーズン一覧の取得に失敗しました: {e}")