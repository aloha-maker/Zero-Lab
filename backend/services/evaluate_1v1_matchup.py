# backend/services/evaluate_1v1_matchup.py
import asyncio
from typing import Tuple, Dict, Any, List
from core.supabase import SupabaseClient
from schemas.evaluate_1v1_matchup import (
    Step2Request, 
    Step2Response, 
    FilteredPokemon, 
    AdvantageJudgment, 
    DisadvantageCategory
)
from .matchup_core import calculate_effective_defense_index, calculate_damage_risk
from .type_matchup import fetch_type_data, calculate_multiplier_and_message
from .pokemon_detail import fetch_pokemon_data

# ダメージが「通る」とみなす基準となるリスク値（環境に合わせて調整してください）
DAMAGE_RISK_THRESHOLD = 50.0  

def evaluate_1v1_matchup(
    candidate_stats: dict, 
    candidate_moves: List[dict],
    target_stats: dict, 
    target_moves: List[dict],
    type_data_map: Dict[str, Any]
) -> Tuple[AdvantageJudgment, DisadvantageCategory | None]:
    """
    1対1の状況をシミュレートし、◎, ◯, △, × と その理由を返す
    """
    
    # ---------------------------------------------------------
    # 1. 候補(自分) -> 敵(相手) への最大ダメージリスクを算出
    # ---------------------------------------------------------
    max_damage_to_target = 0.0
    for move in candidate_moves:
        is_physical = move.get("category") == "物理"
        t_data = type_data_map.get(move.get("move_type"))
        if not t_data: continue
            
        multiplier, _ = calculate_multiplier_and_message(t_data, target_stats.get("types", []))
        
        effective_def = calculate_effective_defense_index(
            is_physical, 
            multiplier, 
            target_stats.get("hp_times_defense", 1), 
            target_stats.get("hp_times_sp_defense", 1)
        )
        damage_risk = calculate_damage_risk(move.get("power_times_atk", 0), effective_def)
        if damage_risk > max_damage_to_target:
            max_damage_to_target = damage_risk

    # ---------------------------------------------------------
    # 2. 敵(相手) -> 候補(自分) への最大ダメージリスクを算出
    # ---------------------------------------------------------
    max_damage_from_target = 0.0
    for move in target_moves:
        is_physical = move.get("category") == "物理"
        t_data = type_data_map.get(move.get("move_type"))
        if not t_data: continue
        
        multiplier, _ = calculate_multiplier_and_message(t_data, candidate_stats.get("types", []))
        
        effective_def = calculate_effective_defense_index(
            is_physical, 
            multiplier, 
            candidate_stats.get("hp_times_defense", 1), 
            candidate_stats.get("hp_times_sp_defense", 1)
        )
        damage_risk = calculate_damage_risk(move.get("power_times_atk", 0), effective_def)
        if damage_risk > max_damage_from_target:
            max_damage_from_target = damage_risk
        
    # ---------------------------------------------------------
    # 3. 素早さの比較 と 総合判定（◎/◯/△/×）
    # ---------------------------------------------------------
    candidate_speed = candidate_stats.get("speed", 0)
    target_speed = target_stats.get("speed", 0)

    # パターンA：上から叩かれて致命傷を受ける（速度負け）
    if target_speed > candidate_speed and max_damage_from_target > DAMAGE_RISK_THRESHOLD:
        return "×", "A：速度負け"
        
    # パターンC：相手が固すぎてこちらのダメージが全く通らない（数値受け）
    if max_damage_to_target < (DAMAGE_RISK_THRESHOLD / 2):
        return "△", "C：数値受け"
        
    # パターンB, D は特性や補助技のフラグが必要になるため、ここでは省略
    # 必要に応じてデータモデルに 'has_priority_move' などを追加して判定します
        
    # どちらでもなく、こちらの火力が相手よりも十分に通るなら有利（◎）
    if max_damage_to_target > DAMAGE_RISK_THRESHOLD and max_damage_from_target < DAMAGE_RISK_THRESHOLD:
        return "◎", None
        
    # それ以外は通常の殴り合い（◯）
    return "◯", None


async def execute_step2_filtering(
    req: Step2Request, 
    supabase: SupabaseClient
) -> Step2Response:
    filtered_list = []
    
    # 1. 候補ポケモンと敵ポケモンの「名前」をすべて抽出し、重複を排除
    candidate_names = [c.name for c in req.candidates]
    target_names = [t.opponent_name for t in req.targets]
    all_pokemon_names = list(set(candidate_names + target_names))
    
    # 2. pokemon_detail.py を使って全ポケモンの詳細データを並列取得
    # キャッシュが効くため、高速に処理されます
    fetch_tasks = [fetch_pokemon_data(supabase, name) for name in all_pokemon_names]
    raw_results = await asyncio.gather(*fetch_tasks, return_exceptions=True)
    
    # 3. 取得したデータを、判定ロジック(evaluate_1v1_matchup)が計算しやすい形に変換
    pokemon_details_map = {}
    unique_move_types = set()
    
    for name, res in zip(all_pokemon_names, raw_results):
        # 取得失敗（Exception）はスキップ
        if isinstance(res, Exception):
            continue
            
        stats = res.base_stats #[cite: 4]
        
        # 耐久指数の事前計算
        hp_def = stats["hp"] * stats["defense"]
        hp_spdef = stats["hp"] * stats["sp_defense"]
        
        # 技データの変換（変化技を除外＆攻撃指数の計算）
        adapted_moves = []
        for m in res.moves: #[cite: 4]
            if m.power and m.power > 0: #[cite: 4]
                # 物理か特殊かで掛けるステータスを変える
                atk_stat = stats["attack"] if m.damage_class == "物理" else stats["sp_attack"] #[cite: 4]
                
                # タイプ一致ボーナス（STAB: 1.5倍）の計算
                stab_multiplier = 1.5 if m.type in res.types else 1.0 #[cite: 4]
                
                adapted_moves.append({
                    "move_name": m.name,
                    "move_type": m.type,
                    "category": m.damage_class,
                    "power_times_atk": int(m.power * atk_stat * stab_multiplier) # 攻撃指数
                })
                unique_move_types.add(m.type)
                
        pokemon_details_map[name] = {
            "base_stats": {
                "hp_times_defense": hp_def,
                "hp_times_sp_defense": hp_spdef,
                "speed": stats["speed"],
                "types": res.types
            },
            "season_moves": adapted_moves
        }
                
    # 4. 必要なタイプ相性データのみを並列で取得
    type_data_tasks = [fetch_type_data(supabase, t_ja) for t_ja in unique_move_types]
    type_data_results = await asyncio.gather(*type_data_tasks)
    type_data_map = dict(zip(unique_move_types, type_data_results))
    
    # 5. フィルタリングの実行
    for candidate in req.candidates:
        c_detail = pokemon_details_map.get(candidate.name)
        if not c_detail:
            continue
            
        good_against = []
        
        for target in req.targets:
            t_detail = pokemon_details_map.get(target.opponent_name)
            if not t_detail:
                continue
                
            # 1対1の相性判定ロジックを実行
            judgment, reason = evaluate_1v1_matchup(
                candidate_stats=c_detail["base_stats"],
                candidate_moves=c_detail["season_moves"],
                target_stats=t_detail["base_stats"],
                target_moves=t_detail["season_moves"],
                type_data_map=type_data_map
            )
            
            # 判定が ◎ または ◯ の場合、有利な相手として記録
            if judgment in ["◎", "◯"]:
                good_against.append(target.opponent_name)
                
        # すべてに対して「△」か「×」ではない（＝有利な相手が1体以上いる）なら残す
        if len(good_against) > 0:
            filtered_list.append(FilteredPokemon(
                id=candidate.id,
                name=candidate.name,
                types=candidate.types,
                rank=candidate.rank,
                good_matchups=good_against
            ))
            
    return Step2Response(filtered_candidates=filtered_list)