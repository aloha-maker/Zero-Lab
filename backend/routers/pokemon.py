from fastapi import APIRouter, Path, Query, HTTPException
from typing import List, Optional
from schemas.pokemon import PokemonInfo, PokemonListItem
from services.pokemon import fetch_pokemon_data, get_pokemon_list_by_rule

router = APIRouter()


@router.get("/", response_model=List[PokemonListItem])
async def get_pokemon_list(
    rule_id: Optional[int] = Query(None, description="ルールID。指定時はそのルールで使用可能なポケモンのみを返す。")
):
    """
    ポケモン候補一覧を取得する。
    - rule_id 指定あり: そのルールで使用可能なポケモンのみ返却
    - rule_id 指定なし: 全ポケモンは件数が膨大なため 400 を返す（呼び出し側で rule_id を必須にすること）
    """
    if rule_id is None:
        raise HTTPException(
            status_code=400,
            detail="rule_id は必須です。シーズンを選択してから候補を取得してください。"
        )
    return await get_pokemon_list_by_rule(rule_id)


@router.get("/{name_or_id}", response_model=PokemonInfo)
async def get_pokemon(
    name_or_id: str = Path(..., description="検索したいポケモンの英語名または図鑑番号")
):
    return await fetch_pokemon_data(name_or_id)