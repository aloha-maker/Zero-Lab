# backend/services/pokemon_detail.py
"""
単体ポケモンの詳細情報取得サービス（種族名(フォルム名) の検索フォーマットに対応）。
"""
from __future__ import annotations

import re  # 括弧のパース用に正規表現モジュールを追加
from async_lru import alru_cache
from fastapi import HTTPException

from core.supabase import SupabaseClient
from schemas.pokemon import PokemonInfo, PokemonMoveDetail

@alru_cache(maxsize=256)
async def fetch_pokemon_data(supabase: SupabaseClient, name_or_id: str) -> PokemonInfo:
    is_id = name_or_id.isdigit()
    
    select_query = (
        "id, form_category, form_name_ja, form_name_en, hp, attack, defense, sp_attack, sp_defense, speed, height_dm, weight_hg, image_url, "
        "species:pokemon_species!inner(national_dex_no, name_ja, name_en), "
        "pokemon_types(types(name_ja)), "
        "pokemon_abilities(abilities(name_ja)), "
        "pokemon_moves(moves(name_ja, power, accuracy, damage_class, types(name_ja)))"
    )

    response = None

    if is_id:
        response = supabase.table("pokemon").select(select_query) \
            .eq("species.national_dex_no", int(name_or_id)) \
            .order("id").limit(1).execute()
            
    elif any(ord(c) > 127 for c in name_or_id):
        # 日本語検索
        # 1. "種族名(フォルム名)" もしくは "種族名（フォルム名）" の形式かチェック
        # 例: 「サンド(アローラのすがた)」 -> 「サンド」と「アローラのすがた」に分解
        match = re.match(r"^([^\(（]+)[\(（](.+)[）\)]$", name_or_id)
        
        if match:
            base_name = match.group(1).strip()
            form_name = match.group(2).strip()
            
            # 親テーブルの種族名と、子テーブルのフォルム名が両方一致する行を特定
            response = supabase.table("pokemon").select(select_query) \
                .eq("species.name_ja", base_name) \
                .eq("form_name_ja", form_name) \
                .order("id").limit(1).execute()
        
        # 2. 括弧形式ではない、または上記でヒットしなかった場合は「フォルム名」単一で検索（例: メガガブリアス）
        if not response or not response.data:
            response = supabase.table("pokemon").select(select_query) \
                .eq("form_name_ja", name_or_id) \
                .order("id").limit(1).execute()
        
        # 3. それでも見つからなければ「種族名」単一で検索（例: ガブリアス）
        if not response.data:
            response = supabase.table("pokemon").select(select_query) \
                .eq("species.name_ja", name_or_id) \
                .order("id").limit(1).execute()
    else:
        # 英語検索
        # 1. "Species (Form)" の形式かチェック (例: "Sandshrew (Alolan Form)")
        match = re.match(r"^([^\(]+)\((.+)\)$", name_or_id)
        
        if match:
            base_name = match.group(1).strip()
            form_name = match.group(2).strip()
            
            response = supabase.table("pokemon").select(select_query) \
                .ilike("species.name_en", base_name) \
                .ilike("form_name_en", form_name) \
                .order("id").limit(1).execute()

        # 2. フォルム名単一で検索
        if not response or not response.data:
            response = supabase.table("pokemon").select(select_query) \
                .ilike("form_name_en", name_or_id) \
                .order("id").limit(1).execute()
        
        # 3. 見つからなければ種族名単一で検索
        if not response.data:
            response = supabase.table("pokemon").select(select_query) \
                .ilike("species.name_en", name_or_id) \
                .order("id").limit(1).execute()

    if not response or not response.data:
        raise HTTPException(status_code=404, detail="Pokemon not found")

    data = response.data[0]
    species = data.get("species", {})

    form_category = data.get("form_category", "")
    base_name_ja = species.get("name_ja", "")
    form_name_ja = data.get("form_name_ja", "")

    base_name_en = species.get("name_en", "")
    form_name_en = data.get("form_name_en", "")

    # form_category に応じた表示名の決定ロジック
    if form_category == "normal":
        display_name = base_name_ja
        display_name_en = base_name_en
    elif form_category == "mega":
        display_name = form_name_ja if form_name_ja else base_name_ja
        display_name_en = form_name_en if form_name_en else base_name_en
    else:
        if form_name_ja:
            display_name = f"{base_name_ja}({form_name_ja})"
        else:
            display_name = base_name_ja

        if form_name_en:
            display_name_en = f"{base_name_en} ({form_name_en})"
        else:
            display_name_en = base_name_en

    # タイプと特性の抽出
    types = [
        pt["types"]["name_ja"] 
        for pt in data.get("pokemon_types", []) if pt.get("types")
    ]
    
    abilities = [
        pa["abilities"]["name_ja"] 
        for pa in data.get("pokemon_abilities", []) if pa.get("abilities")
    ]

    # 技データの抽出
    moves = []
    for pm in data.get("pokemon_moves", []):
        move_data = pm.get("moves")
        if move_data:
            move_type_data = move_data.get("types")
            move_type_ja = move_type_data.get("name_ja") if move_type_data else "不明"
            
            moves.append(
                PokemonMoveDetail(
                    name=move_data.get("name_ja", ""),
                    type=move_type_ja,
                    power=move_data.get("power"),
                    accuracy=move_data.get("accuracy"),
                    damage_class=move_data.get("damage_class") or "不明"
                )
            )

    base_stats = {
        "hp": data["hp"],
        "attack": data["attack"],
        "defense": data["defense"],
        "sp_attack": data["sp_attack"],
        "sp_defense": data["sp_defense"],
        "speed": data["speed"]
    }

    return PokemonInfo(
        id=species.get("national_dex_no"), 
        name=display_name,
        english_name=display_name_en,
        types=types,
        abilities=abilities,
        base_stats=base_stats,
        weight_kg=data["weight_hg"] / 10.0,
        height_m=data["height_dm"] / 10.0,
        moves=moves,
        image_url=data.get("image_url")
    )