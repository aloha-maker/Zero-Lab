from fastapi import HTTPException
from typing import Dict, Any

from core.supabase import SupabaseClient


class PartyService:
    @staticmethod
    def get_all_parties(supabase: SupabaseClient):
        try:
            response = supabase.table("parties").select(
                "*, party_members(*, pokemon_builds(*))"
            ).order("created_at", desc=True).execute()
            return response.data
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"パーティ一覧の取得に失敗しました: {str(e)}")

    @staticmethod
    def get_party_by_id(supabase: SupabaseClient, party_id: str):
        try:
            response = supabase.table("parties").select(
                "*, party_members(*, pokemon_builds(*))"
            ).eq("id", party_id).execute()

            if not response.data:
                raise HTTPException(status_code=404, detail="指定されたパーティが見つかりません。")

            return response.data[0]
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @staticmethod
    def create_party(supabase: SupabaseClient, party_data: Dict[str, Any]):
        try:
            # 1. パーティの基本情報を登録
            party_res = supabase.table("parties").insert({
                "name": party_data["name"],
                "description": party_data.get("description")
            }).execute()

            party_id = party_res.data[0]["id"]

            # 2. パーティメンバーが存在する場合は登録
            members = party_data.get("members", [])
            if members:
                members_data = [
                    {
                        "party_id": party_id,
                        "build_id": m["build_id"],
                        "slot_index": m["slot_index"]
                    }
                    for m in members
                ]
                supabase.table("party_members").insert(members_data).execute()

            return {"status": "success", "message": "パーティを作成しました", "party_id": party_id}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"パーティの作成に失敗しました: {str(e)}")

    @staticmethod
    def update_party(supabase: SupabaseClient, party_id: str, party_data: Dict[str, Any]):
        try:
            # 1. パーティの基本情報を更新
            supabase.table("parties").update({
                "name": party_data["name"],
                "description": party_data.get("description"),
                "updated_at": "now()"
            }).eq("id", party_id).execute()

            # 2. 既存のメンバーを全削除 (洗い替え方式)
            supabase.table("party_members").delete().eq("party_id", party_id).execute()

            # 3. 新しいメンバー構成を登録
            members = party_data.get("members", [])
            if members:
                members_data = [
                    {
                        "party_id": party_id,
                        "build_id": m["build_id"],
                        "slot_index": m["slot_index"]
                    }
                    for m in members
                ]
                supabase.table("party_members").insert(members_data).execute()

            return {"status": "success", "message": "パーティを更新しました"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"パーティの更新に失敗しました: {str(e)}")

    @staticmethod
    def delete_party(supabase: SupabaseClient, party_id: str):
        try:
            response = supabase.table("parties").delete().eq("id", party_id).execute()

            if not response.data:
                raise HTTPException(status_code=404, detail="削除対象のパーティが見つかりません。")

            return {"status": "success", "message": "パーティを削除しました"}
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"パーティの削除に失敗しました: {str(e)}")