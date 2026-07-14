# backend/services/strategy.py
import math
import asyncio
from typing import List, Dict, Any, Tuple, Optional
from core.supabase import SupabaseClient
from services.status import calculate_real_status
from services.type_matchup import fetch_type_data, calculate_multiplier_and_message
from services.pokemon_season import get_active_season_pokemon_details
from schemas.strategy import (
    AutoMatrixRequest, MatrixResponse, MatrixResultRow,
    AdvantageJudgment, DisadvantageCategory, ActionOrder,
    BulkMatrixRequest, BulkMatrixResponse, CandidateMatrixResult,
)

# H/A/B/C/D/S（フロント/リクエスト表記） ⇔ hp/attack/defense/sp_attack/sp_defense/speed（内部キー）
STAT_KEY_MAP = {"H": "hp", "A": "attack", "B": "defense", "C": "sp_attack", "D": "sp_defense", "S": "speed"}

# 行動保障（通称：眠り粉・鬼火等の妨害）を持つ、機能停止判定の対象となる相手
STATUS_THREAT_POKEMON_NAMES = ["ディンルー", "キョジオーン", "カバルドン", "ドヒドイデ"]


class MatrixService:
    @staticmethod
    async def generate_auto_matrix(request: AutoMatrixRequest, supabase: SupabaseClient) -> MatrixResponse:
        """
        Supabaseのデータを用いて
        有利不利マトリクスを完全自動実行・機械的判定します。
        （主軸ポケモン1体・手動EVs指定 向け）
        """
        # 0. 環境トップ50の非同期一括取得
        all_environment_pokemons = await get_active_season_pokemon_details(supabase)
        active_environment_pokemons = [
            opp for opp in all_environment_pokemons if opp.rank <= 50
        ]

        # 1. 主軸ポケモンのデータ補完と実数値計算
        main_name = request.main_pokemon_name
        main_base_data = next((p for p in active_environment_pokemons if p.name == main_name), None)

        if not main_base_data:
            from services.pokemon_detail import fetch_pokemon_data
            try:
                main_base_data = await fetch_pokemon_data(supabase, main_name)
            except Exception as e:
                raise ValueError(f"ポケモンのデータソースが空です。{e}")

        request_nature_name = getattr(request, 'nature', 'まじめ')

        evs_dict = request.evs if isinstance(request.evs, dict) else request.evs.model_dump()
        main_evs_internal = {
            internal_key: int(evs_dict.get(api_key, 0))
            for api_key, internal_key in STAT_KEY_MAP.items()
        }

        base_stats_source = main_base_data.base_stats if hasattr(main_base_data, 'base_stats') else main_base_data.get('base_stats', {})
        main_real_stats = MatrixService._calculate_real_stats(base_stats_source, main_evs_internal, request_nature_name)

        main_types = main_base_data.types if hasattr(main_base_data, 'types') else main_base_data.get('types', [])
        main_moves = getattr(main_base_data, 'season_moves', [])
        main_moves_parsed = [
            m.model_dump() if hasattr(m, 'model_dump') else m for m in main_moves
        ]

        # 2. 必要なタイプ相性データを一括取得（主軸の技 ＋ 環境全体の技）
        type_data_map = await MatrixService._build_type_data_map(
            supabase, [main_moves_parsed], active_environment_pokemons
        )

        # 3. マッチアップシミュレーション（主軸 vs 環境トップ50）
        results = MatrixService._simulate_subject_vs_environment(
            subject_name=main_name,
            subject_real_stats=main_real_stats,
            subject_types=main_types,
            subject_moves_parsed=main_moves_parsed,
            active_environment_pokemons=active_environment_pokemons,
            type_data_map=type_data_map,
            verbose=True,
        )

        return MatrixResponse(
            main_pokemon_name=request.main_pokemon_name,
            matrix=results
        )

    @staticmethod
    async def generate_bulk_matrix(request: BulkMatrixRequest, supabase: SupabaseClient) -> BulkMatrixResponse:
        """
        Step2で絞り込んだ候補ポケモン群（10〜30体想定）について、
        環境トップ50とのマトリクスを一括計算します。

        各候補は、主軸のように手動でEVsを指定する代わりに、
        使用率1位の努力値・性格（top_evs / top_nature）を自動採用します。
        環境トップ50データ・タイプ相性データは候補間で1回だけ取得し使い回します。
        """
        # 0. 環境トップ50の非同期一括取得（候補間で共有）
        all_environment_pokemons = await get_active_season_pokemon_details(supabase)
        active_environment_pokemons = [
            opp for opp in all_environment_pokemons if opp.rank <= 50
        ]

        # 1. 候補ポケモンのデータ補完
        #    環境データ（ランキング上位）に含まれていればそれを使い、
        #    含まれていない候補のみ個別に取得する
        candidate_data_map: Dict[str, Any] = {p.name: p for p in all_environment_pokemons}

        missing_names = [
            c.name for c in request.candidates if c.name not in candidate_data_map
        ]
        if missing_names:
            from services.pokemon_detail import fetch_pokemon_data
            fetch_tasks = [fetch_pokemon_data(supabase, name) for name in missing_names]
            fetched_results = await asyncio.gather(*fetch_tasks, return_exceptions=True)
            for name, data in zip(missing_names, fetched_results):
                if not isinstance(data, Exception):
                    candidate_data_map[name] = data

        candidate_moves_parsed_list = []
        for candidate in request.candidates:
            subject_data = candidate_data_map.get(candidate.name)
            if not subject_data:
                continue
            moves = getattr(subject_data, 'season_moves', [])
            candidate_moves_parsed_list.append(
                [m.model_dump() if hasattr(m, 'model_dump') else m for m in moves]
            )

        # 2. 必要なタイプ相性データを一括取得（候補全体の技 ＋ 環境全体の技）
        type_data_map = await MatrixService._build_type_data_map(
            supabase, candidate_moves_parsed_list, active_environment_pokemons
        )

        # 3. 候補ごとにマッチアップシミュレーションを実行
        results: List[CandidateMatrixResult] = []

        for candidate in request.candidates:
            subject_data = candidate_data_map.get(candidate.name)
            if not subject_data:
                # データソースが見つからない候補はスキップ（フロント側で欠損扱い）
                continue

            subject_nature = getattr(subject_data, 'top_nature', 'まじめ')
            subject_evs = getattr(subject_data, 'top_evs', {}) or {}
            subject_base_stats = subject_data.base_stats if hasattr(subject_data, 'base_stats') else subject_data.get('base_stats', {})
            subject_real_stats = MatrixService._calculate_real_stats(subject_base_stats, subject_evs, subject_nature)

            subject_types = subject_data.types if hasattr(subject_data, 'types') else subject_data.get('types', [])
            subject_moves = getattr(subject_data, 'season_moves', [])
            subject_moves_parsed = [
                m.model_dump() if hasattr(m, 'model_dump') else m for m in subject_moves
            ]

            matrix = MatrixService._simulate_subject_vs_environment(
                subject_name=candidate.name,
                subject_real_stats=subject_real_stats,
                subject_types=subject_types,
                subject_moves_parsed=subject_moves_parsed,
                active_environment_pokemons=active_environment_pokemons,
                type_data_map=type_data_map,
                verbose=False,  # 候補数×50体分のログはノイズになるため抑制
            )

            results.append(CandidateMatrixResult(
                id=candidate.id,
                name=candidate.name,
                matrix=matrix,
            ))

        return BulkMatrixResponse(results=results)

    # -----------------------------------------------------------------
    # 共通ヘルパー
    # -----------------------------------------------------------------

    @staticmethod
    async def _build_type_data_map(
        supabase: SupabaseClient,
        subject_moves_parsed_groups: List[List[dict]],
        active_environment_pokemons: list,
    ) -> Dict[str, Any]:
        """
        主体側（主軸 or 候補群）の技タイプ ＋ 環境トップ50の技タイプを集約し、
        必要なタイプ相性データを重複なく一括取得する
        """
        all_types_in_env = set()

        for moves_parsed in subject_moves_parsed_groups:
            for m in moves_parsed:
                if m.get("move_type"):
                    all_types_in_env.add(m["move_type"])

        for opp in active_environment_pokemons:
            opp_moves = opp.season_moves if hasattr(opp, 'season_moves') else opp.get('season_moves', [])
            for m in opp_moves:
                m_dict = m.model_dump() if hasattr(m, 'model_dump') else m
                if m_dict.get("move_type"):
                    all_types_in_env.add(m_dict["move_type"])

        all_types_list = [t for t in all_types_in_env if t]
        tasks = [fetch_type_data(supabase, t) for t in all_types_list]
        fetched_data_list = await asyncio.gather(*tasks)

        return dict(zip(all_types_list, fetched_data_list))

    @staticmethod
    def _calculate_real_stats(base_stats: dict, evs_internal: dict, nature_name: str) -> dict:
        """
        種族値・努力値（内部キー: hp/attack/defense/sp_attack/sp_defense/speed）・性格から
        実数値（レベル50・個体値31固定）を計算する
        """
        real_stats = {}
        for api_key, internal_key in STAT_KEY_MAP.items():
            is_hp = (api_key == "H")
            base = base_stats.get(internal_key, 100)
            ev = int(evs_internal.get(internal_key, 0))

            real_stats[internal_key] = calculate_real_status(
                is_hp=is_hp,
                base_stat=base,
                iv=31,
                ev=ev,
                level=50,
                nature_name=nature_name,
                stat_key=internal_key
            )
        return real_stats

    @staticmethod
    def _simulate_subject_vs_environment(
        subject_name: str,
        subject_real_stats: dict,
        subject_types: list,
        subject_moves_parsed: List[dict],
        active_environment_pokemons: list,
        type_data_map: Dict[str, Any],
        verbose: bool = False,
    ) -> List[MatrixResultRow]:
        """
        1体（主軸 or 候補）を環境トップ50全員と対面させ、
        技選択・ターン数計算・◎◯△×判定を行う。
        generate_auto_matrix / generate_bulk_matrix から共通で呼び出される。
        """
        results: List[MatrixResultRow] = []

        for opp in active_environment_pokemons:
            opp_nature_name = getattr(opp, 'top_nature', 'まじめ')
            opp_evs_dict = getattr(opp, 'top_evs', {}) or {}
            opp_real_stats = MatrixService._calculate_real_stats(opp.base_stats, opp_evs_dict, opp_nature_name)

            opp_moves = opp.season_moves if hasattr(opp, 'season_moves') else opp.get('season_moves', [])
            opp_moves_parsed = [
                m.model_dump() if hasattr(m, 'model_dump') else m for m in opp_moves
            ]

            # ------------------------------------------------------------
            # 動的な最大打点（最適技）の選定
            # ------------------------------------------------------------
            # ① 自分から相手への最適技を探す
            best_my_turns = 3
            best_my_move = {"move_name": "攻撃技", "move_type": subject_types[0] if subject_types else "ノーマル", "power": 90, "category": "物理"}
            my_multiplier = 1.0

            if subject_moves_parsed:
                for move in subject_moves_parsed:
                    if move.get("category") == "変化" or not move.get("power"):
                        continue

                    my_move_type = move.get("move_type")
                    type_data = type_data_map.get(my_move_type)
                    if type_data:
                        multiplier, _ = calculate_multiplier_and_message(type_data, opp.types)
                    else:
                        multiplier = 1.0

                    turns = MatrixService._calc_dynamic_turns_to_kill(
                        atk_stats=subject_real_stats, def_stats=opp_real_stats,
                        move=move, atk_types=subject_types, multiplier=multiplier
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
                        multiplier, _ = calculate_multiplier_and_message(type_data, subject_types)
                    else:
                        multiplier = 1.0

                    turns = MatrixService._calc_dynamic_turns_to_kill(
                        atk_stats=opp_real_stats, def_stats=subject_real_stats,
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
            if subject_real_stats["speed"] >= opp_real_stats["speed"]:
                action_order = ActionOrder.FIRST
            else:
                action_order = ActionOrder.SECOND

            has_status_threat = opp.name in STATUS_THREAT_POKEMON_NAMES

            judgment, category = MatrixService._run_flowchart(
                action_order, my_turns, opp_turns, has_status_threat
            )

            if verbose:
                print(f"==================================================")
                print(f"【対面シミュレーション】攻撃側: {subject_name} vs 相手: {opp.name} (Rank: {opp.rank})")
                print(f"  ■ S関係: 自分S={subject_real_stats['speed']} | 相手S={opp_real_stats['speed']} ➔ 行動順: {action_order.name}")
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

        return results

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