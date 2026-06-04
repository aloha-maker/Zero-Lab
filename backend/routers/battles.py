from fastapi import APIRouter, HTTPException, Depends
from typing import List
from uuid import UUID
from schemas.battle import BattleCreate, BattleResponse, BattleUpdate, OpponentPokemonUpdate
# ※既存のDI（DBセッションやSupabaseクライアントの注入）に合わせてDependsを調整してください
# from core.dependencies import get_supabase

router = APIRouter(
    prefix="/battles",
    tags=["battles"],
)

@router.post("/", response_model=BattleResponse)
async def create_battle(battle_in: BattleCreate):
    """対戦開始時：新規バトルと相手のパーティ6匹をDBに登録する"""
    # 実際の実装は services/battle.py に委譲します
    # return await battle_service.create_battle(supabase, battle_in)
    pass

@router.put("/{battle_id}/pokemons")
async def sync_opponent_pokemons(battle_id: UUID, pokemons: List[OpponentPokemonUpdate]):
    """
    【楽観的UI用】対戦中の状態同期
    フロントエンドからのUIタップ操作（選出・ひんし等）を受け取り、
    Supabaseの battle_opponent_pokemons テーブルを Upsert (一括更新) する
    """
    # 実際の実装は services/battle.py に委譲します
    # return await battle_service.upsert_opponent_pokemons(supabase, battle_id, pokemons)
    pass

@router.put("/{battle_id}", response_model=BattleResponse)
async def finish_battle(battle_id: UUID, battle_in: BattleUpdate):
    """対戦終了時：勝敗結果や自分の選出、メモを保存する"""
    # return await battle_service.update_battle(supabase, battle_id, battle_in)
    pass

@router.get("/", response_model=List[BattleResponse])
async def get_match_history(user_id: UUID, limit: int = 20):
    """ホーム画面用：過去の対戦履歴（ネストされたポケモンデータ含む）を取得する"""
    # return await battle_service.get_battles_by_user(supabase, user_id, limit)
    pass