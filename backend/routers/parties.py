from fastapi import APIRouter, Depends
from core.supabase import get_supabase, SupabaseClient
from schemas.party import PartyCreateSchema
from services.party import PartyService

router = APIRouter()


@router.get("/")
def get_parties(supabase: SupabaseClient = Depends(get_supabase)):
    """全てのパーティ一覧を取得します。"""
    data = PartyService.get_all_parties(supabase)
    return {"status": "success", "data": data}


@router.get("/{party_id}")
def get_party(party_id: str, supabase: SupabaseClient = Depends(get_supabase)):
    """特定のパーティ詳細を取得します。"""
    data = PartyService.get_party_by_id(supabase, party_id)
    return {"status": "success", "data": data}


@router.post("/")
def create_party(party: PartyCreateSchema, supabase: SupabaseClient = Depends(get_supabase)):
    """新しいパーティと、そのメンバーを作成します。"""
    return PartyService.create_party(supabase, party.dict())


@router.put("/{party_id}")
def update_party(party_id: str, party: PartyCreateSchema, supabase: SupabaseClient = Depends(get_supabase)):
    """既存のパーティ情報とメンバー構成を更新します。"""
    return PartyService.update_party(supabase, party_id, party.dict())


@router.delete("/{party_id}")
def delete_party(party_id: str, supabase: SupabaseClient = Depends(get_supabase)):
    """パーティを削除します。"""
    return PartyService.delete_party(supabase, party_id)