import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, validator
from typing import List, Optional
from supabase import create_client, Client

# 環境変数からSupabaseの接続情報を取得 (実際の環境に合わせて調整してください)
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

# 接続情報がない場合はエラーを回避しつつ、初期化を遅延させるなど適宜対応してください
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

router = APIRouter()

# --- Pydantic スキーマ ---

class PartyMemberSchema(BaseModel):
    build_id: str = Field(..., description="pokemon_buildsテーブルのUUID")
    slot_index: int = Field(..., ge=1, le=6, description="配置スロット(1〜6)")

class PartyCreateSchema(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    members: List[PartyMemberSchema]

    @validator('members')
    def validate_members(cls, members):
        if len(members) > 6:
            raise ValueError('パーティメンバーは最大6匹までです。')
        
        # スロットの重複チェック
        slots = [m.slot_index for m in members]
        if len(slots) != len(set(slots)):
            raise ValueError('スロット番号(slot_index)に重複があります。')
        return members

# --- API エンドポイント ---

@router.get("/")
def get_parties():
    """
    全てのパーティ一覧を取得します。
    パーティに紐づくメンバーと、その育成個体情報(pokemon_builds)も結合して返します。
    """
    try:
        # Supabaseの機能でリレーション先をネストして取得
        response = supabase.table("parties").select(
            "*, party_members(*, pokemon_builds(*))"
        ).order("created_at", desc=True).execute()
        
        return {"status": "success", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"パーティ一覧の取得に失敗しました: {str(e)}")

@router.get("/{party_id}")
def get_party(party_id: str):
    """特定のパーティ詳細を取得します。"""
    try:
        response = supabase.table("parties").select(
            "*, party_members(*, pokemon_builds(*))"
        ).eq("id", party_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="指定されたパーティが見つかりません。")
            
        return {"status": "success", "data": response.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
def create_party(party: PartyCreateSchema):
    """新しいパーティと、そのメンバーを作成します。"""
    try:
        # 1. パーティの基本情報を登録
        party_res = supabase.table("parties").insert({
            "name": party.name,
            "description": party.description
        }).execute()
        
        party_id = party_res.data[0]["id"]

        # 2. パーティメンバーが存在する場合は登録
        if party.members:
            members_data = [
                {
                    "party_id": party_id,
                    "build_id": m.build_id,
                    "slot_index": m.slot_index
                }
                for m in party.members
            ]
            supabase.table("party_members").insert(members_data).execute()

        return {"status": "success", "message": "パーティを作成しました", "party_id": party_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"パーティの作成に失敗しました: {str(e)}")

@router.put("/{party_id}")
def update_party(party_id: str, party: PartyCreateSchema):
    """既存のパーティ情報とメンバー構成を更新します。"""
    try:
        # 1. パーティの基本情報を更新
        supabase.table("parties").update({
            "name": party.name,
            "description": party.description,
            "updated_at": "now()"
        }).eq("id", party_id).execute()

        # 2. 既存のメンバーを全削除 (洗い替え方式)
        supabase.table("party_members").delete().eq("party_id", party_id).execute()

        # 3. 新しいメンバー構成を登録
        if party.members:
            members_data = [
                {
                    "party_id": party_id,
                    "build_id": m.build_id,
                    "slot_index": m.slot_index
                }
                for m in party.members
            ]
            supabase.table("party_members").insert(members_data).execute()

        return {"status": "success", "message": "パーティを更新しました"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"パーティの更新に失敗しました: {str(e)}")

@router.delete("/{party_id}")
def delete_party(party_id: str):
    """パーティを削除します。関連するメンバーもカスケード削除されます。"""
    try:
        # DB側で ON DELETE CASCADE を設定しているため、partiesを消せばparty_membersも消えます
        response = supabase.table("parties").delete().eq("id", party_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="削除対象のパーティが見つかりません。")
            
        return {"status": "success", "message": "パーティを削除しました"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"パーティの削除に失敗しました: {str(e)}")