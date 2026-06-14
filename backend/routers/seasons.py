from fastapi import APIRouter, HTTPException
from typing import List
from schemas.seasons import SeasonPokemonResponse,SeasonResponse,TypeVulnerabilityResult
from services import seasons as seasons_service
from services.pokemon import get_active_season_pokemon_details
from services.seasons import calculate_most_vulnerable_defense_types

router = APIRouter(tags=["seasons"])

@router.get("/latest_pokemons", response_model=SeasonPokemonResponse) # 💡 response_modelを変更
async def get_season_pokemon_details():
    """
    指定されたシーズン（ルールID）で利用可能なポケモンの詳細一覧と、
    上位50位を基準とした防御側不利タイプランキングを取得する。
    """
    try:
        # 1. ポケモンの詳細データを一斉取得
        detailed_pokemons = await get_active_season_pokemon_details()
        
        # 2. 取得したデータを元に、防御側の不利タイプランキングを計算
        vulnerable_ranking = await calculate_most_vulnerable_defense_types(detailed_pokemons)
        
        # 3. 両方のデータをまとめて返却
        return SeasonPokemonResponse(
            pokemons=detailed_pokemons,
            vulnerable_ranking=vulnerable_ranking
        )
        
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
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