from fastapi import APIRouter, HTTPException
from typing import List
from schemas.seasons import SeasonResponse
from schemas.pokemon import PokemonInfo
from services import seasons as seasons_service
from services.pokemon import get_active_season_pokemon_details

router = APIRouter(tags=["seasons"])

@router.get("/latest_pokemons", response_model=List[PokemonInfo])
async def get_season_pokemon_details():
    """
    指定されたシーズン（ルールID）で利用可能なポケモンの詳細一覧（名前、タイプ、種族値など）を取得する。
    """
    try:
        # 非同期関数なので await をつけて呼び出します
        return await get_active_season_pokemon_details()
    except HTTPException as http_exc:
        # サービス側から投げられた HTTPException（503エラーなど）はそのままスルーしてフロントに返します
        raise http_exc
    except Exception as e:
        # その他の予期せぬエラー（DB接続エラーなど）は500番でキャッチします
        raise HTTPException(
            status_code=500, 
            detail=f"シーズン対象ポケモンの取得に失敗しました: {e}"
        )

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