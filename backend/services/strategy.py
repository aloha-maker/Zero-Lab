# backend/services/strategy.py
import math
import asyncio
from typing import List, Dict, Any, Tuple, Optional
from core.supabase import SupabaseClient
from services.status import calculate_real_status, NATURE_MODIFIERS, DEFAULT_NATURE
from services.type_matchup import fetch_type_data, calculate_multiplier_and_message
from services.pokemon_season import get_active_season_pokemon_details
from schemas.strategy import (
    AutoMatrixRequest, MatrixResponse, MatrixResultRow,
    AdvantageJudgment, DisadvantageCategory, ActionOrder
)

class MatrixService:
    @staticmethod
    async def generate_auto_matrix(request: AutoMatrixRequest, supabase: SupabaseClient) -> MatrixResponse:
        """
        Supabaseのデータを用いて
        有利不利マトリクスを完全自動実行・機械的判定します。
        """
        results = []

        # 0. 環境トップ50の非同期一括取得
        all_environment_pokemons = await get_active_season_pokemon_details(supabase)
        active_environment_pokemons = [
            opp for opp in all_environment_pokemons if opp.rank <= 50
        ]
        
        # ① 主軸ポケモンのデータ補完と実数値計算
        main_name = request.main_pokemon_name
        main_base_data = next((p for p in active_environment_pokemons if p.name == main_name), None)
        
        if not main_base_data:
            from services.pokemon_detail import fetch_pokemon_data
            try:
                main_base_data = await fetch_pokemon_data(supabase, main_name)
            except:
                raise ValueError(f"ポケモンのデータソースが空です。")
        
        request_nature_name = getattr(request, 'nature', 'まじめ')
        main_nature = NATURE_MODIFIERS.get(request_nature_name, DEFAULT_NATURE)

        main_real_stats = {}
        stat_key_map = {"H": "hp", "A": "attack", "B": "defense", "C": "sp_attack", "D": "sp_defense", "S": "speed"}
        evs_dict = request.evs if isinstance(request.evs, dict) else request.evs.model_dump()

        for api_key, internal_key in stat_key_map.items():
            is_hp = (api_key == "H")
            base_stats_source = main_base_data.base_stats if hasattr(main_base_data, 'base_stats') else main_base_data.get('base_stats', {})
            base = base_stats_source.get(internal_key, 100)
            ev = int(evs_dict.get(api_key, 0))

            modifier = main_nature[internal_key]
            main_real_stats[internal_key] = calculate_real_status(
                is_hp=is_hp, base_stat=base, iv=31, ev=ev, level=50, nature_modifier=modifier
            )

        main_types = main_base_data.types if hasattr(main_base_data, 'types') else main_base_data.get('types', [])
        main_moves = getattr(main_base_data, 'season_moves', [])
        main_moves_parsed = [
            m.model_dump() if hasattr(m, 'model_dump') else m for m in main_moves
        ]
        
        # すべての技タイプデータを事前に一括キャッシュ
        all_types_in_env = set()
    
        for m in main_moves:
            m_dict = m.model_dump() if hasattr(m, 'model_dump') else m
            if m_dict.get("move_type"): all_types_in_env.add(m_dict["move_type"])
            
        for opp in active_environment_pokemons:
            opp_moves = opp.season_moves if hasattr(opp, 'season_moves') else opp.get('season_moves', [])
            for m in opp_moves:
                m_dict = m.model_dump() if hasattr(m, 'model_dump') else m
                if m_dict.get("move_type"): all_types_in_env.add(m_dict["move_type"])

        tasks = [fetch_type_data(supabase, t) for t in all_types_in_env if t]
        fetched_data_list = await asyncio.gather(*tasks)
        
        type_data_map = {}
        for t_name, d in zip([t for t in all_types_in_env if t], fetched_data_list):
            type_data_map[t_name] = d

        # ②＆③ 環境トップのループ処理とマッチアップシミュレーション
        for opp in active_environment_pokemons:
            opp_real_stats = {}
            
            opp_nature_name = getattr(opp, 'nature', 'まじめ')
            opp_nature_map = NATURE_MODIFIERS.get(opp_nature_name, DEFAULT_NATURE)
            
            for api_key, internal_key in stat_key_map.items():
                is_hp = (api_key == "H")
                base = opp.base_stats.get(internal_key, 100)
                
                opp_nature_modifier = opp_nature_map[internal_key]
                calc_opp_ev = 0
                
                opp_real_stats[internal_key] = calculate_real_status(
                    is_hp=is_hp, base_stat=base, iv=31, ev=calc_opp_ev, level=50, nature_modifier=opp_nature_modifier
                )
            
            opp_moves = opp.season_moves if hasattr(opp, 'season_moves') else opp.get('season_moves', [])
            opp_moves_parsed = [
                m.model_dump() if hasattr(m, 'model_dump') else m for m in opp_moves
            ]
            
            # ------------------------------------------------------------
            # 動的な最大打点（最適技）の選定
            # ------------------------------------------------------------
            # ① 自分から相手への最適技を探す
            best_my_turns = 3
            best_my_move = {"move_name": "攻撃技", "move_type": main_types[0] if main_types else "ノーマル", "power": 90, "category": "物理"}
            my_multiplier = 1.0
            
            if main_moves_parsed:
                for move in main_moves_parsed:
                    if move.get("category") == "変化" or not move.get("power"):
                        continue
                    
                    # 修正点：opp.type_efficacies ではなく type_matchup.py のロジックを使用
                    my_move_type = move.get("move_type")
                    type_data = type_data_map.get(my_move_type)
                    if type_data:
                        multiplier, _ = calculate_multiplier_and_message(type_data, opp.types)
                    else:
                        multiplier = 1.0

                    turns = MatrixService._calc_dynamic_turns_to_kill(
                        atk_stats=main_real_stats, def_stats=opp_real_stats,
                        move=move, atk_types=main_types, multiplier=multiplier
                    )
                    if turns < best_my_turns:
                        best_my_turns = turns
                        best_my_move = move        
                        my_multiplier = multiplier 

            # ② 相手から自分への最適技を探す
            best_opp_turns = 3
            best_opp_move = {"move_name": "攻撃技", "move_type": opp.types[0] if opp.types else "ノーマル", "power": 80, "category": "物理"}
            opp_multiplier = 1.0

            if opp_moves_parsed:
                for move in opp_moves_parsed:
                    if move.get("category") == "変化" or not move.get("power"):
                        continue
                    
                    opp_move_type = move.get("move_type")
                    type_data = type_data_map.get(opp_move_type)
                    
                    if type_data:
                        # 修正点：英語への変換を排除し、日本語の主軸タイプ(main_types)を直接渡す
                        multiplier, _ = calculate_multiplier_and_message(type_data, main_types)
                    else:
                        multiplier = 1.0

                    turns = MatrixService._calc_dynamic_turns_to_kill(
                        atk_stats=opp_real_stats, def_stats=main_real_stats,
                        move=move, atk_types=opp.types, multiplier=multiplier
                    )
                    if turns < best_opp_turns:
                        best_opp_turns = turns
                        best_opp_move = move          
                        opp_multiplier = multiplier   

            my_turns = best_my_turns
            opp_turns = best_opp_turns

            # ------------------------------------------------------------
            # ③ マッチアップ判定（素早さ比較 ＆ フローチャート実行）
            # ------------------------------------------------------------
            if main_real_stats["speed"] >= opp_real_stats["speed"]:
                action_order = ActionOrder.FIRST
            else:
                action_order = ActionOrder.SECOND
                
            has_status_threat = opp.name in ["ディンルー", "キョジオーン", "カバルドン", "ドヒドイデ"]

            judgment, category = MatrixService._run_flowchart(
                action_order, my_turns, opp_turns, has_status_threat
            )
            
            # ------------------------------------------------------------
            # ログ出力
            # ------------------------------------------------------------
            print(f"==================================================")
            print(f"【対面シミュレーション】主軸: {main_name} vs 相手: {opp.name} (Rank: {opp.opponent_rank if hasattr(opp, 'opponent_rank') else opp.rank})")
            print(f"  ■ S関係: 主軸S={main_real_stats['speed']} | 相手S={opp_real_stats['speed']} ➔ 行動順: {action_order.name}")
            print(f"  ■ 自分 ➔ 相手:")
            print(f"    - 使用技: {best_my_move.get('move_name')} ({best_my_move.get('move_type')} / 威力:{best_my_move.get('power')})")
            print(f"    - 相性倍率: {my_multiplier}倍")
            print(f"    - 撃破ターン数: {my_turns}ターン")
            print(f"  ■ 相手 ➔ 自分:")
            print(f"    - 使用技: {best_opp_move.get('move_name')} ({best_opp_move.get('move_type')} / 威力:{best_opp_move.get('power')})")
            print(f"    - 相性倍率: {opp_multiplier}倍")
            print(f"    - 被撃破ターン数: {opp_turns}ターン")
            print(f"  ➔ 判定結果: {judgment.name} (カテゴリ: {category.name if category else 'None'})")
            print(f"==================================================")
            
            results.append(MatrixResultRow(
                opponent_rank=opp.rank,
                opponent_name=opp.name,
                judgment=judgment,
                reason_category=category
            ))
            
        return MatrixResponse(
            main_pokemon_name=request.main_pokemon_name,
            matrix=results
        )
        
    @staticmethod
    def _calc_dynamic_turns_to_kill(atk_stats: dict, def_stats: dict, move: dict, atk_types: list, multiplier: float) -> int:
        """
        動的なタイプ相性 multiplier を加味して、乱数下振れの悲観的確定数を算出します。
        ★変化技などの威力None/0対策を追加した安全版
        """
        # 1. 技の威力が None または 0、あるいは変化技の場合は、殴り合いで一撃突破はできない（確3以上）として安全に返す
        if move.get("power") is None or move.get("power") == 0 or move.get("category") == "変化":
            return 3

        # 物理・特殊に応じた実数値の取得
        atk_val = atk_stats["attack"] if move["category"] == "物理" else atk_stats["sp_attack"]
        def_val = def_stats["defense"] if move["category"] == "物理" else def_stats["sp_defense"]
        
        # 万が一、実数値側が0やNoneだった場合の安全弁
        if not atk_val or not def_val:
            return 3

        try:
            # 50レベルダメージ計算公式
            base_damage = math.trunc((50 * 2 / 5 + 2) * int(move["power"]) * atk_val / def_val)
            damage = math.trunc(base_damage / 50 + 2)
            
            # タイプ一致補正 (1.5倍)
            if move.get("move_type") in atk_types:
                damage = math.trunc(damage * 1.5)
                
            # 動的なタイプ相性倍率を適用
            damage = math.trunc(damage * multiplier)
            
            # 悲観的下振れ補正 (乱数最低値 0.85)
            damage = math.trunc(damage * 0.85)
            
            if damage <= 0:
                return 3
                
            target_hp = def_stats["hp"]
            if damage >= target_hp:
                return 1
            elif damage * 2 >= target_hp:
                return 2
            else:
                return 3
        except Exception as e:
            # 万が一、その他のデータ不備で計算が転んだ場合もシステムを落とさず確3にする
            print(f"Warning: ダメージ計算中に予期せぬエラーが発生しました: {e}")
            return 3

    @staticmethod
    def _run_flowchart(action_order: ActionOrder, my_turns: int, opp_turns: int, has_threat: bool) -> Tuple[AdvantageJudgment, Optional[DisadvantageCategory]]:
        base_judgment = AdvantageJudgment.FAIR
        
        if action_order == ActionOrder.FIRST:
            if my_turns == 1:
                base_judgment = AdvantageJudgment.EXCELLENT
            elif my_turns == 2 and opp_turns >= 2:
                base_judgment = AdvantageJudgment.GOOD
            elif my_turns == 2 and opp_turns == 1:
                base_judgment = AdvantageJudgment.FAIR
            elif my_turns >= 3:
                base_judgment = AdvantageJudgment.FAIR
        else:
            if my_turns == 1 and opp_turns >= 2:
                base_judgment = AdvantageJudgment.GOOD
            elif my_turns == 2 and opp_turns >= 3:
                base_judgment = AdvantageJudgment.GOOD
            elif my_turns == 2 and opp_turns == 2:
                base_judgment = AdvantageJudgment.FAIR
            elif opp_turns == 1:
                base_judgment = AdvantageJudgment.BAD

        if has_threat and not (action_order == ActionOrder.FIRST and my_turns == 1):
            base_judgment = AdvantageJudgment.BAD

        category = None
        if base_judgment in [AdvantageJudgment.FAIR, AdvantageJudgment.BAD]:
            if has_threat:
                category = DisadvantageCategory.D
            elif my_turns >= 3:
                category = DisadvantageCategory.C
            elif action_order == ActionOrder.SECOND:
                category = DisadvantageCategory.A
            elif action_order == ActionOrder.FIRST and opp_turns == 1:
                category = DisadvantageCategory.B
                
        return base_judgment, category