from fastapi import APIRouter, Depends, HTTPException, Security
from fastapi.security.api_key import APIKeyHeader
from schemas.sync import ScrapeMovesRequest, ScrapeStatsRequest
from services.pokemon_sync import sync_pokemon_data, sync_scraped_moves, sync_scraped_stats
from core.config import settings
from core.supabase import get_supabase, SupabaseClient

router = APIRouter()

# APIキー認証の設定
api_key_header = APIKeyHeader(name=settings.SYNC_API_KEY_HEADER, auto_error=True)

def get_api_key(api_key_header: str = Security(api_key_header)):
    """
    リクエストヘッダーに含まれるAPIキーを検証する
    """
    # config.pyで一元管理されたAPIキーを使用
    if api_key_header != settings.SYNC_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing API Key")
    return api_key_header

@router.post("/pokemon")
async def sync_pokemon(
    api_key: str = Depends(get_api_key),
    supabase: SupabaseClient = Depends(get_supabase)
):
    """
    PokeAPI (GraphQL) から最新のポケモンデータを取得し、Supabaseに同期する
    """
    try:
        result = await sync_pokemon_data(supabase)
        return {
            "status": "success",
            "message": "Pokemon data synced successfully",
            "summary": result
        }
    except Exception as e:
        print(f"[Error] Sync failed: {e}")
        raise HTTPException(status_code=500, detail=f"Sync process failed: {str(e)}")

@router.post("/pokemon/scrape-moves")
async def scrape_pokemon_moves(
    request: ScrapeMovesRequest,
    api_key: str = Depends(get_api_key),
    supabase: SupabaseClient = Depends(get_supabase)
):
    """
    指定されたURLから特定のポケモンの技をスクレイピングして同期する
    """
    try:
        result = await sync_scraped_moves(supabase, request.pokemon_id, request.url)
        return {
            "status": "success",
            "message": f"Successfully scraped moves for Pokemon {request.pokemon_id}",
            "summary": result
        }
    except Exception as e:
        print(f"[Error] Scraping failed: {e}")
        raise HTTPException(status_code=500, detail=f"Scraping process failed: {str(e)}")

@router.post("/pokemon/scrape-stats")
async def scrape_pokemon_stats(
    request: ScrapeStatsRequest,
    api_key: str = Depends(get_api_key),
    supabase: SupabaseClient = Depends(get_supabase)
):
    """
    指定されたURLから特定のポケモンの種族値をスクレイピングして同期する
    (PokeAPI側にメガシンカ等サブフォームの種族値が無い場合の代替データソース)
    """
    try:
        result = await sync_scraped_stats(
            supabase,
            request.pokemon_id,
            request.url,
        )
        return {
            "status": "success",
            "message": f"Successfully scraped stats for Pokemon {request.pokemon_id}",
            "summary": result
        }
    except Exception as e:
        print(f"[Error] Scraping failed: {e}")
        raise HTTPException(status_code=500, detail=f"Scraping process failed: {str(e)}")