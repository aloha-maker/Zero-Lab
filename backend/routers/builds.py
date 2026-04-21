from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from supabase import create_client, Client
import os

router = APIRouter()

# Supabase接続設定（環境変数から取得）
SUPABASE_URL = os.getenv("SUPABASE_URL", "your_supabase_url")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "your_supabase_key")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Pydanticスキーマ定義
class PokemonBuildBase(BaseModel):
    pokemon_id: int
    pokemon_name: str
    nickname: Optional[str] = ""
    nature: str
    ability: str
    item: str
    tera_type: str
    moves: List[str] = Field(default_factory=list, max_items=4)
    evs: Dict[str, int] = Field(default_factory=lambda: {"H":0, "A":0, "B":0, "C":0, "D":0, "S":0})
    ivs: Dict[str, int] = Field(default_factory=lambda: {"H":31, "A":31, "B":31, "C":31, "D":31, "S":31})
    memo: Optional[str] = ""

class PokemonBuildCreate(PokemonBuildBase):
    pass

class PokemonBuildResponse(PokemonBuildBase):
    id: str

@router.post("/", response_model=PokemonBuildResponse)
def create_build(build: PokemonBuildCreate):
    """育成ポケモンの登録 (Create)"""
    data = build.dict()
    res = supabase.table("pokemon_builds").insert(data).execute()
    if not res.data:
         raise HTTPException(status_code=400, detail="登録に失敗しました")
    return res.data[0]

@router.get("/", response_model=List[PokemonBuildResponse])
def get_builds():
    """育成ポケモンの一覧取得 (Read)"""
    res = supabase.table("pokemon_builds").select("*").order("created_at", desc=True).execute()
    return res.data

@router.put("/{build_id}", response_model=PokemonBuildResponse)
def update_build(build_id: str, build: PokemonBuildCreate):
    """育成ポケモンの更新 (Update)"""
    res = supabase.table("pokemon_builds").update(build.dict()).eq("id", build_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="対象が見つかりません")
    return res.data[0]

@router.delete("/{build_id}")
def delete_build(build_id: str):
    """育成ポケモンの削除 (Delete)"""
    res = supabase.table("pokemon_builds").delete().eq("id", build_id).execute()
    return {"message": "削除完了"}

@router.post("/{build_id}/copy", response_model=PokemonBuildResponse)
def copy_build(build_id: str):
    """育成ポケモンのコピー (Copy)"""
    # 既存データを取得
    existing = supabase.table("pokemon_builds").select("*").eq("id", build_id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="コピー元が見つかりません")
    
    copy_data = existing.data[0]
    # IDと作成日時を除外して新規登録
    copy_data.pop("id", None)
    copy_data.pop("created_at", None)
    copy_data["nickname"] = f"{copy_data.get('nickname', copy_data['pokemon_name'])}のコピー"
    
    res = supabase.table("pokemon_builds").insert(copy_data).execute()
    return res.data[0]