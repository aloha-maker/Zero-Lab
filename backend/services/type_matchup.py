# backend/services/type_matchup.py
from __future__ import annotations

from typing import List, Tuple, Set, Dict, Any
from async_lru import alru_cache
from fastapi import HTTPException

from core.supabase import SupabaseClient

# ==========================================
# 1. 既存の攻撃相性計算ロジック
# ==========================================

@alru_cache(maxsize=36)
async def fetch_type_data(supabase: SupabaseClient, type_name: str) -> dict:
    """DBからタイプ情報と相性情報を取得する"""
    
    # 1. typesテーブルから日本語または英語名でタイプを検索
    response = supabase.table("types").select("id, name_ja, name_en") \
        .or_(f"name_ja.eq.{type_name},name_en.ilike.{type_name}") \
        .limit(1).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail=f"Type not found: {type_name}")

    type_info = response.data[0]
    type_id = type_info["id"]

    # 2. type_efficacies テーブルから、このタイプが「攻撃側」のときの相性倍率を取得
    eff_response = supabase.table("type_efficacies").select(
        "damage_factor, target_type:types!target_type_id(name_ja)"
    ).eq("damage_type_id", type_id).execute()

    # 防御側タイプ名(日本語)をキーに、倍率を保持する辞書を作成
    damage_relations = {}
    if eff_response.data:
        for eff in eff_response.data:
            target_name = eff.get("target_type", {}).get("name_ja")
            factor = eff.get("damage_factor", 100)
            if target_name:
                damage_relations[target_name] = factor / 100.0

    return {
        "id": type_id,
        "name_ja": type_info["name_ja"],
        "name_en": type_info["name_en"],
        "damage_relations": damage_relations
    }

def calculate_multiplier_and_message(type_data: dict, defenders: List[str]) -> Tuple[float, str]:
    """タイプ相性の倍率とメッセージを計算する"""
    damage_relations = type_data.get("damage_relations", {})
    
    multiplier = 1.0
    for defender in defenders:
        multiplier *= damage_relations.get(defender, 1.0)

    if multiplier > 1.0:
        msg = "効果は ばつぐんだ！"
    elif multiplier < 1.0 and multiplier > 0.0:
        msg = "効果は いまひとつのようだ"
    elif multiplier == 0.0:
        msg = "効果がないようだ…"
    else:
        msg = "等倍ダメージ"

    return multiplier, msg


# ==========================================
# 2. 相性補完（弱点被りなし）ポケモンの算出ロジック
# ==========================================

@alru_cache(maxsize=1)
async def fetch_all_type_efficacies(supabase: SupabaseClient) -> List[Dict[str, Any]]:
    """
    全タイプの相性表を一括取得してキャッシュする。
    補完計算で何度も呼び出されるため、パフォーマンス向上のための措置。
    """
    response = supabase.table("type_efficacies").select("*").execute()
    return response.data

def calculate_defensive_weaknesses(target_type_ids: List[int], efficacies: List[Dict[str, Any]]) -> Set[int]:
    """ポケモンのタイプIDリストから、弱点（2倍・4倍）となる攻撃側タイプIDのSetを返す純粋な関数"""
    weaknesses = set()
    # 攻撃側の全18タイプ (ID: 1~18を想定)
    for attack_type_id in range(1, 19):
        total_factor = 1.0
        for target_type_id in target_type_ids:
            # 相性表から倍率を取得（PokeAPI準拠: 200=2倍, 50=0.5倍など）
            match = next((e for e in efficacies if e['damage_type_id'] == attack_type_id and e['target_type_id'] == target_type_id), None)
            factor = (match['damage_factor'] / 100.0) if match else 1.0
            total_factor *= factor
        
        # 最終倍率が2倍以上なら弱点として登録
        if total_factor >= 2.0:
            weaknesses.add(attack_type_id)
            
    return weaknesses

async def get_complementary_pokemon_service(supabase: SupabaseClient, base_pokemon_id: int) -> dict:
    """主軸ポケモンの弱点と被らない（相性補完に優れる）ポケモンを全フォルム含めてリストアップする"""
    
    # 1. 全相性表の取得（キャッシュ利用）
    efficacies = await fetch_all_type_efficacies(supabase)
    
    # 2. 主軸ポケモンのタイプを取得
    base_types_res = supabase.table("pokemon_types").select("type_id").eq("pokemon_id", base_pokemon_id).execute()
    if not base_types_res.data:
        raise HTTPException(status_code=404, detail="Base Pokemon not found or has no types.")
    base_type_ids = [t["type_id"] for t in base_types_res.data]
    
    # 3. 主軸ポケモンの弱点を計算
    base_weaknesses = calculate_defensive_weaknesses(base_type_ids, efficacies)
    
    # =========================================================
    # pokemon_season.py のロジックを応用した全フォルム取得処理
    # =========================================================
    
    # 4. ランキング情報とベースとなるPokeAPI IDを取得
    # pokemon_battle_db_mapping をINNER JOINして確実な数値IDを取得する
    rankings_res = supabase.table("pokemon_rankings").select(
        "rank, pokemon_battle_db_mapping!inner(poke_api_id)"
    ).order("rank").execute()

    base_api_ids = []
    rank_map = {}
    for r in rankings_res.data or []:
        mapping_list = r.get("pokemon_battle_db_mapping")
        if mapping_list and isinstance(mapping_list, list):
            api_id = mapping_list[0].get("poke_api_id")
            if api_id is not None:
                api_id = int(api_id)
                base_api_ids.append(api_id)
                rank_map[api_id] = r.get("rank", 999) # 順位を保持

    # 5. ベースポケモンの取得と species_id の抽出
    select_query = (
        "id, species_id, form_name_ja, "
        "species:pokemon_species!inner(name_ja), "
        "pokemon_types(type_id, types(name_ja))"
    )
    
    base_pokemons = []
    chunk_size = 100
    # チャンク分割して基本データを取得[cite: 4]
    for i in range(0, len(base_api_ids), chunk_size):
        chunk = base_api_ids[i : i + chunk_size]
        resp = supabase.table("pokemon").select(select_query).in_("id", chunk).execute()
        if resp.data:
            base_pokemons.extend(resp.data)
            
    # 6. その種族に紐づく「すべてのフォルム」を一括取得
    # ベースポケモンから species_id を抽出[cite: 4]
    species_ids = list({p["species_id"] for p in base_pokemons if p.get("species_id")})
    all_forms = []
    if species_ids:
        for i in range(0, len(species_ids), chunk_size):
            s_chunk = species_ids[i : i + chunk_size]
            # form_categoryの縛りをなくし、同種族(species_id)の全フォルムを取得[cite: 4]
            resp = supabase.table("pokemon").select(select_query).in_("species_id", s_chunk).execute()
            if resp.data:
                all_forms.extend(resp.data)

    # species_id をキーにして、ベースポケモンのランキング順位を引き継ぐためのマップ[cite: 4]
    species_to_rank = {p["species_id"]: rank_map.get(p["id"], 999) for p in base_pokemons if p.get("species_id")}
    
    complements = []
    processed_ids = set() # 重複判定用
    
    # 7. 全フォルムに対して弱点計算と補完判定を実行
    for p in all_forms:
        poke_id = p["id"]
        if poke_id in processed_ids:
            continue
        processed_ids.add(poke_id)
        
        species_id = p.get("species_id")
        if species_id not in species_to_rank:
            continue # ランキング外の種族はスキップ
            
        # 順位と名前の整形
        rank = species_to_rank[species_id]
        species_name = p.get("species", {}).get("name_ja", "不明")
        form_name = p.get("form_name_ja")
        display_name = f"{species_name}({form_name})" if form_name else species_name
        
        cand_types_data = p.get("pokemon_types", [])
        cand_type_ids = [t["type_id"] for t in cand_types_data]
        cand_type_names = [t["types"]["name_ja"] for t in cand_types_data if "types" in t]
        
        # 弱点判定
        cand_weaknesses = calculate_defensive_weaknesses(cand_type_ids, efficacies)
        
        # 共通の弱点がない（積集合が空）場合のみリストに追加
        if base_weaknesses.isdisjoint(cand_weaknesses):
            complements.append({
                "id": poke_id,
                "name": display_name,
                "types": cand_type_names,
                "rank": rank
            })
            
    # 最終的にランキング順にソートして返却
    complements.sort(key=lambda x: x["rank"])
    
    return {
        "base_pokemon_id": base_pokemon_id,
        "base_weaknesses": list(base_weaknesses),
        "complements": complements
    }