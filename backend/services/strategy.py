import math
from typing import List, Dict, Any, Tuple, Optional
# 既存の実数値計算関数をインポート
from services.status import calculate_real_status
from services.pokemon_season import get_active_season_pokemon_details
from schemas.strategy import (
    AutoMatrixRequest, MatrixResponse, MatrixResultRow,
    AdvantageJudgment, DisadvantageCategory, ActionOrder
)

class MatrixService:
    @staticmethod
    async def generate_auto_matrix(request: AutoMatrixRequest) -> MatrixResponse:
        """
        Supabase + PokeAPI のリアルデータを用いて
        有利不利マトリクスを完全自動実行・機械的判定します。
        """
        results = []

        # ----------------------------------------------------------------
        # 0. 環境トップ50（リアルシーズンデータ）の非同期一括取得
        # ----------------------------------------------------------------
        # SupabaseやGraphQLから、順位・種族値・相性・技が成形されたモデルリストが届きます
        all_environment_pokemons = await get_active_season_pokemon_details()
        active_environment_pokemons = [
            opp for opp in all_environment_pokemons if opp.rank <= 50
        ]
        

        # ----------------------------------------------------------------
        # ① 主軸ポケモンのデータ補完と実数値計算
        # ----------------------------------------------------------------
        main_name = request.main_pokemon_name
        
        # 環境データの中に主軸と同じポケモンがいれば、その基礎データを流用する（最適化）
        main_base_data = next((p for p in active_environment_pokemons if p.name == main_name), None)
        
        # もし環境トップにいなければ、個別にPokeAPIから詳細を取得して補完（フォールバック）
        if not main_base_data:
            from services.pokemon_detail import fetch_pokemon_data
            try:
                main_base_data = await fetch_pokemon_data(main_name)
            except:
                # 万が一取得失敗した場合は、リストの先頭を借りるかエラー処理
                if active_environment_pokemons:
                    main_base_data = active_environment_pokemons[0]
                else:
                    raise ValueError(f"ポケモンのデータソースが空です。")

        main_real_stats = {}
        # 主軸の性格補正（仮でいじっぱり: A上昇/C下降 を想定。必要に応じてスキーマ拡張可能）
        main_nature = {"hp": 1.0, "attack": 1.1, "defense": 1.0, "sp_attack": 0.9, "sp_defense": 1.0, "speed": 1.0}
        
        # スキーマ（H/A/B/C/D/S）から実数値パース用の内部キー（hp/attack...）へのマッピング
        stat_key_map = {"H": "hp", "A": "attack", "B": "defense", "C": "sp_attack", "D": "sp_defense", "S": "speed"}
        evs_dict = request.evs if isinstance(request.evs, dict) else request.evs.model_dump()

        for api_key, internal_key in stat_key_map.items():
            is_hp = (api_key == "H")
            # 辞書型またはPydanticモデルの base_stats から種族値を取得
            base_stats_source = main_base_data.base_stats if hasattr(main_base_data, 'base_stats') else main_base_data.get('base_stats', {})
            base = base_stats_source.get(internal_key, 100)
            
            # フロントから届く 0〜32 努力値スケールをゲーム内（最大252）に復元
            raw_ev = int(evs_dict.get(api_key, 0))
            calc_ev = min(raw_ev * 8, 252)

            modifier = main_nature[internal_key]
            main_real_stats[internal_key] = calculate_real_status(
                is_hp=is_hp, base_stat=base, iv=31, ev=calc_ev, level=50, nature_modifier=modifier
            )

        # 主軸の「タイプ」リストを取得
        main_types = main_base_data.types if hasattr(main_base_data, 'types') else main_base_data.get('types', [])
        # 主軸のメイン技（暫定で season_moves の1番目、無ければ威力100の物理技を偽装）
        main_moves = main_base_data.season_moves if hasattr(main_base_data, 'season_moves') else main_base_data.get('season_moves', [])
        main_attack_move = main_moves[0] if main_moves else {"move_name": "攻撃技", "move_type": main_types[0] if main_types else "ノーマル", "power": 90, "category": "ぶつり"}
        if hasattr(main_attack_move, 'model_dump'):
            main_attack_move = main_attack_move.model_dump()

        # ----------------------------------------------------------------
        # ②＆③ 環境トップのループ処理とマッチアップシミュレーション
        # ----------------------------------------------------------------
        # --- ② 相手（環境トップ）の計算 ---
        for opp in active_environment_pokemons:
            opp_real_stats = {}
            
            for api_key, internal_key in stat_key_map.items():
                is_hp = (api_key == "H")
                
                # Pydanticオブジェクトから安全に種族値（base_stats）を取得
                base = opp.base_stats.get(internal_key, 100)
                
                # ★ ご指摘通り、環境側の努力値は一律で「0」として安全に計算
                calc_opp_ev = 0
                
                # 性格補正は一旦等倍（1.0）として計算
                # （※もし将来的に最速や特化を考慮したい場合はここを調整できます）
                opp_real_stats[internal_key] = calculate_real_status(
                    is_hp=is_hp, base_stat=base, iv=31, ev=calc_opp_ev, level=50, nature_modifier=1.0
                )

            # --- ③ マッチアップ（変更なし。オブジェクト記法に合わせて安全化） ---
            if main_real_stats["speed"] >= opp_real_stats["speed"]:
                action_order = ActionOrder.FIRST
            else:
                action_order = ActionOrder.SECOND
                
            # 相手の繰り出してくる最大火力技を取得
            opp_moves = opp.season_moves
            opp_attack_move = opp_moves[0] if opp_moves else {"move_name": "攻撃技", "move_type": opp.types[0] if opp.types else "ノーマル", "power": 80, "category": "ぶつり"}
            
            # Pydanticモデルだった場合は辞書にパースして計算機に投げる
            if hasattr(opp_attack_move, 'model_dump'):
                opp_attack_move = opp_attack_move.model_dump()

            # ① こちらから相手への確定数 (相手の相性表 `opp.type_efficacies` を参照)
            opp_type_efficacies = opp.type_efficacies if opp.type_efficacies else {}
            my_multiplier = opp_type_efficacies.get(main_attack_move["move_type"], 1.0)
            
            my_turns = MatrixService._calc_dynamic_turns_to_kill(
                atk_stats=main_real_stats, def_stats=opp_real_stats,
                move=main_attack_move, atk_types=main_types, multiplier=my_multiplier
            )
            
            # ② 相手からこちらへの確定数
            opp_turns = MatrixService._calc_dynamic_turns_to_kill(
                atk_stats=opp_real_stats, def_stats=main_real_stats,
                move=opp_attack_move, atk_types=opp.types, multiplier=1.0
            )

            # 特定の変化技脅威を持つポケモンの簡易判定
            has_status_threat = opp.name in ["ディンルー", "キョジオーン", "カバルドン", "ドヒドイデ"]

            # フローチャート判定を実行
            judgment, category = MatrixService._run_flowchart(
                action_order, my_turns, opp_turns, has_status_threat
            )
            
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
        atk_val = atk_stats["attack"] if move["category"] == "ぶつり" else atk_stats["sp_attack"]
        def_val = def_stats["defense"] if move["category"] == "ぶつり" else def_stats["sp_defense"]
        
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