from fastapi import APIRouter
from schemas.party import PartyCreateSchema
from services.party import PartyService

router = APIRouter()

@router.get("/")
def get_parties():
    """全てのパーティ一覧を取得します。"""
    data = PartyService.get_all_parties()
    return {"status": "success", "data": data}

@router.get("/{party_id}")
def get_party(party_id: str):
    """特定のパーティ詳細を取得します。"""
    data = PartyService.get_party_by_id(party_id)
    return {"status": "success", "data": data}

@router.post("/")
def create_party(party: PartyCreateSchema):
    """新しいパーティと、そのメンバーを作成します。"""
    return PartyService.create_party(party.dict())

@router.put("/{party_id}")
def update_party(party_id: str, party: PartyCreateSchema):
    """既存のパーティ情報とメンバー構成を更新します。"""
    return PartyService.update_party(party_id, party.dict())

@router.delete("/{party_id}")
def delete_party(party_id: str):
    """パーティを削除します。"""
    return PartyService.delete_party(party_id)