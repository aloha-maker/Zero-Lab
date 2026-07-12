# backend/services/matchup_core.py

IMMUNE_DEFENSE_PENALTY = 10_000_000

def calculate_effective_defense_index(
    is_physical: bool,
    multiplier: float,
    hp_def: int,
    hp_spdef: int
) -> float:
    """
    攻撃カテゴリとタイプ相性倍率から、対象ポケモンの「実質耐久指数」を計算する
    """
    individual_def_index = hp_def if is_physical else hp_spdef

    if multiplier > 0:
        return individual_def_index / multiplier
    else:
        # 無効（0倍）時の固定巨大ペナルティ
        return float(IMMUNE_DEFENSE_PENALTY)

def calculate_damage_risk(
    power_times_atk: int,
    effective_defense_index: float
) -> float:
    """
    攻撃指数と実質耐久指数から、ダメージリスク（通りの良さ/威力）を算出する
    """
    if effective_defense_index > 0:
        return (power_times_atk / effective_defense_index) * 100000
    return 0.0