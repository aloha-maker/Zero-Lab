import math

# 今後の拡張を見据えた定数化
HP_BASE_ADDITION = 10
OTHER_STAT_BASE_ADDITION = 5

def calculate_real_status(is_hp: bool, base_stat: int, iv: int, ev: int, level: int, nature_modifier: float) -> int:
    """
    ステータス実数値を計算する純粋な関数
    """
    ev_bonus = math.trunc(ev / 4)
    base_calc = math.trunc((base_stat * 2 + iv + ev_bonus) * level / 100)
    
    if is_hp:
        # HPの計算式
        real_stat = base_calc + level + HP_BASE_ADDITION
    else:
        # HP以外の計算式
        real_stat = math.trunc((base_calc + OTHER_STAT_BASE_ADDITION) * nature_modifier)
        
    return real_stat