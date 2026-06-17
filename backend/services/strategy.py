import math
from pickle import FALSE
from typing import List, Dict, Any, Tuple, Optional
# 既存の実数値計算関数をインポート
from services.status import calculate_real_status
from schemas.strategy import (
    AutoMatrixRequest, MatrixResponse, MatrixResultRow,
    AdvantageJudgment, DisadvantageCategory, ActionOrder
)

# ----------------------------------------------------------------
# マスターデータ
# ----------------------------------------------------------------
POKEMON_MASTER: Dict[str, Dict[str, Any]] = {
    "ガブリアス": {"types": ["ドラゴン", "じめん"], "base_stats": {"H": 108, "A": 130, "B": 95, "C": 80, "D": 85, "S": 102}, "move": {"name": "じしん", "type": "じめん", "power": 100, "category": "ぶつり"}},
    "パオジアン": {"types": ["あく", "こおり"], "base_stats": {"H": 80, "A": 120, "B": 80, "C": 90, "D": 65, "S": 135}, "move": {"name": "つららおとし", "type": "こおり", "power": 85, "category": "ぶつり"}},
    "ディンルー": {"types": ["あく", "じめん"], "base_stats": {"H": 155, "A": 110, "B": 125, "C": 55, "D": 80, "S": 45}, "move": {"name": "じしん", "type": "じめん", "power": 100, "category": "ぶつり"}},
    "サーフゴー": {"types": ["はがね", "ゴースト"], "base_stats": {"H": 87, "A": 60, "B": 95, "C": 133, "D": 91, "S": 84}, "move": {"name": "ゴールドラッシュ", "type": "はがね", "power": 120, "category": "とくしゅ"}},
    "カイリュー": {"types": ["ドラゴン", "ひこう"], "base_stats": {"H": 91, "A": 134, "B": 95, "C": 100, "D": 100, "S": 80}, "move": {"name": "しんそく", "type": "ノーマル", "power": 80, "category": "ぶつり"}},
}

# 環境トップ30（努力値を最大32スケールに統一した安全版）
ENVIRONMENT_TOP_30: List[Dict[str, Any]] = [
    {
        "rank": 1, 
        "name": "カイリュー", 
        "nature_modifier": {"S": 1.0, "A": 1.1}, 
        "evs": {"H": 24, "A": 32, "B": 1, "C": 0, "D": 1, "S": 6}, 
        "has_status_move_threat": False
    },
    {
        "rank": 2, 
        "name": "パオジアン", 
        "nature_modifier": {"S": 1.1, "A": 1.0}, 
        "evs": {"H": 1, "A": 32, "B": 0, "C": 0, "D": 0, "S": 32}, 
        "has_status_move_threat": False
    },
    {
        "rank": 3, 
        "name": "サーフゴー", 
        "nature_modifier": {"S": 1.0, "C": 1.1}, 
        "evs": {"H": 31, "A": 0, "B": 1, "C": 32, "D": 1, "S": 1}, 
        "has_status_move_threat": False
    },
    {
        "rank": 4, 
        "name": "ディンルー", 
        "nature_modifier": {"S": 0.9, "B": 1.1}, 
        "evs": {"H": 32, "A": 1, "B": 32, "C": 0, "D": 0, "S": 0}, 
        "has_status_move_threat": True
    },
]


class MatrixService:
    @staticmethod
    def generate_auto_matrix(request: AutoMatrixRequest) -> MatrixResponse:
        results = []
        
        # ----------------------------------------------------------------
        # ① 主軸ポケモンの実数値計算と情報補完
        # ----------------------------------------------------------------
        main_name = request.main_pokemon_name
        if main_name not in POKEMON_MASTER:
            main_name = "ガブリアス"
            
        main_master = POKEMON_MASTER[main_name]
        main_real_stats = {}
        
        # 性格補正（仮で「いじっぱり」を想定）
        main_nature = {"H": 1.0, "A": 1.1, "B": 1.0, "C": 0.9, "D": 1.0, "S": 1.0}
        
        # 努力値の取り出し方を dict とオブジェクトの両方に対応させて安全にする
        evs_dict = request.evs if isinstance(request.evs, dict) else request.evs.model_dump()
        
        for stat_key in ["H", "A", "B", "C", "D", "S"]:
            is_hp = (stat_key == "H")
            base = main_master["base_stats"][stat_key]
            ev = evs_dict.get(stat_key, 0)  # 安全に努力値を取得
            modifier = main_nature[stat_key]
            
            main_real_stats[stat_key] = calculate_real_status(
                is_hp=is_hp, base_stat=base, iv=31, ev=ev, level=50, nature_modifier=modifier
            )

        # ----------------------------------------------------------------
        # ② 環境トップポケモンの実数値計算とループ処理
        # ----------------------------------------------------------------
        for opp in ENVIRONMENT_TOP_30:
            opp_master = POKEMON_MASTER.get(opp["name"], POKEMON_MASTER["カイリュー"])
            opp_real_stats = {}
            
            for stat_key in ["H", "A", "B", "C", "D", "S"]:
                is_hp = (stat_key == "H")
                base = opp_master["base_stats"][stat_key]
                ev = opp["evs"][stat_key]
                modifier = opp["nature_modifier"].get(stat_key, 1.0)
                
                opp_real_stats[stat_key] = calculate_real_status(
                    is_hp=is_hp, base_stat=base, iv=31, ev=ev, level=50, nature_modifier=modifier
                )

            # ----------------------------------------------------------------
            # ③ マッチアップシミュレーションと判定相性ロジック
            # ----------------------------------------------------------------
            
            # STEP 1: 素早さ比較による行動順判定
            if main_real_stats["S"] >= opp_real_stats["S"]:
                action_order = ActionOrder.FIRST
            else:
                action_order = ActionOrder.SECOND
                
            # STEP 2: ダメージ計算と確定数の算出
            my_turns = MatrixService._calc_turns_to_kill(
                atk_stats=main_real_stats, def_stats=opp_real_stats, 
                move=main_master["move"], atk_types=main_master["types"], def_types=opp_master["types"]
            )
            opp_turns = MatrixService._calc_turns_to_kill(
                atk_stats=opp_real_stats, def_stats=main_real_stats, 
                move=opp_master["move"], atk_types=opp_master["types"], def_types=main_master["types"]
            )

            # 機械的判定マトリクスへの流し込み
            judgment, category = MatrixService._run_flowchart(
                action_order, my_turns, opp_turns, opp["has_status_move_threat"]
            )
            
            results.append(MatrixResultRow(
                opponent_rank=opp["rank"],
                opponent_name=opp["name"],
                judgment=judgment,
                reason_category=category
            ))
            
        return MatrixResponse(
            main_pokemon_name=request.main_pokemon_name,
            matrix=results
        )

    @staticmethod
    def _calc_turns_to_kill(atk_stats: dict, def_stats: dict, move: dict, atk_types: list, def_types: list) -> int:
        atk_val = atk_stats["A"] if move["category"] == "ぶつり" else atk_stats["C"]
        def_val = def_stats["B"] if move["category"] == "ぶつり" else def_stats["D"]
        
        # 簡易ダメージ計算公式 (下振れ0.85倍で悲観計算)
        base_damage = math.trunc((50 * 2 / 5 + 2) * move["power"] * atk_val / def_val)
        damage = math.trunc(base_damage / 50 + 2)
        
        if move["type"] in atk_types:
            damage = math.trunc(damage * 1.5)
            
        damage = math.trunc(damage * 0.85)
        
        if damage <= 0:
            return 3
            
        target_hp = def_stats["H"]
        if damage >= target_hp:
            return 1
        elif damage * 2 >= target_hp:
            return 2
        else:
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