from fastapi import APIRouter, Path
from schemas.pokemon import PokemonInfo
from services.pokemon import fetch_pokemon_data

router = APIRouter()

@router.get("/{name_or_id}", response_model=PokemonInfo)
async def get_pokemon(
    name_or_id: str = Path(..., description="検索したいポケモンの英語名または図鑑番号")
):
    # ロジックはservices層に委譲し、結果をそのまま返す
    return await fetch_pokemon_data(name_or_id)