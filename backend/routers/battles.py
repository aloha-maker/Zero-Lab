from fastapi import APIRouter, HTTPException, Depends
from typing import List
from uuid import UUID
from schemas.battle import BattleCreate, BattleResponse, BattleUpdate, OpponentPokemonUpdate,BattleResultUpdate,BattleAdviceRequest, BattleAdviceResponse
from services import battle as battle_service
from services.battle import BattleAdviceService

router = APIRouter(prefix="/battles", tags=["battles"])

@router.post("/", response_model=BattleResponse)
async def create_new_battle(battle_in: BattleCreate):
    return await battle_service.create_battle(battle_in)


@router.put("/{battle_id}/pokemons")
async def sync_pokemons(battle_id: UUID, pokemons: List[OpponentPokemonUpdate]):
    return await battle_service.upsert_opponent_pokemons(battle_id, pokemons)

@router.patch("/{battle_id}/result")
async def update_result(battle_id: UUID, result_in: BattleResultUpdate):
    return await battle_service.update_battle_result(battle_id, result_in)

@router.get("/", response_model=List[BattleResponse])
async def get_match_history(user_id: UUID, limit: int = 20):
    """ホーム画面用：過去の対戦履歴（ネストされたポケモンデータ含む）を取得する"""
    # return await battle_service.get_battles_by_user(supabase, user_id, limit)
    pass

@router.post("/advice", response_model=BattleAdviceResponse)
async def get_battle_advice(
    request: BattleAdviceRequest, 
    service: BattleAdviceService = Depends()
):
    try:
        # 目標3秒以内を意識しつつサービスを呼び出し
        advice = await service.generate_advice(request)
        return advice
    except Exception as e:
        # F-009: 適切なエラーハンドリングとメッセージ
        raise HTTPException(
            status_code=500, 
            detail=f"Gemini APIによる分析に失敗しました。時間をおいて再度お試しください。({str(e)})"
        )