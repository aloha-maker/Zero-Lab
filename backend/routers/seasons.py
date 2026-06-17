from fastapi import APIRouter, HTTPException,Depends
from typing import List
from schemas.seasons import SeasonPokemonResponse,SeasonResponse,MoveAttackIndexResult
from services import seasons as seasons_service
from services.pokemon_season import get_active_season_pokemon_details
from services.seasons import calculate_real_damage_ranking
from core.supabase import get_supabase, SupabaseClient

router = APIRouter(tags=["seasons"])

@router.get("/latest_pokemons", response_model=SeasonPokemonResponse)
async def get_season_pokemon_details(supabase: SupabaseClient = Depends(get_supabase)):
    try:
        detailed_pokemons = await get_active_season_pokemon_details(supabase)
        print('here')
        # 新しい実質ダメージランキングを算出
        real_damage_ranking = await calculate_real_damage_ranking(detailed_pokemons)
        
        return SeasonPokemonResponse(
            pokemons=detailed_pokemons,
            real_damage_ranking=real_damage_ranking
        )
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"データ取得・分析に失敗しました: {e}"
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