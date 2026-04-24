# backend/services/build_service.py
from supabase import create_client, Client
import os
from fastapi import HTTPException
from typing import List, Dict, Any

# 設定の型安全化 (ガイドライン 1.11, 1.12 参照) [cite: 11, 12]
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

class BuildService:
    @staticmethod
    def create_build(build_data: Dict[str, Any]):
        res = supabase.table("pokemon_builds").insert(build_data).execute()
        if not res.data:
            raise HTTPException(status_code=400, detail="登録に失敗しました")
        return res.data[0]

    @staticmethod
    def get_all_summaries():
        response = supabase.table("pokemon_builds").select("id, pokemon_id, pokemon_name").execute()
        return response.data

    @staticmethod
    def get_build_by_id(build_id: str):
        res = supabase.table("pokemon_builds").select("*").eq("id", build_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="データが見つかりません")
        return res.data[0]

    @staticmethod
    def update_build(build_id: str, build_data: Dict[str, Any]):
        res = supabase.table("pokemon_builds").update(build_data).eq("id", build_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="更新対象が見つかりません")
        return res.data[0]

    @staticmethod
    def delete_build(build_id: str):
        supabase.table("pokemon_builds").delete().eq("id", build_id).execute()
        return {"message": "削除完了"}

    @staticmethod
    def copy_build(build_id: str):
        existing_data = BuildService.get_build_by_id(build_id)
        
        copy_data = existing_data.copy()
        copy_data.pop("id", None)
        copy_data.pop("created_at", None)
        copy_data["nickname"] = f"{copy_data.get('nickname', copy_data['pokemon_name'])}のコピー"
        
        return BuildService.create_build(copy_data)