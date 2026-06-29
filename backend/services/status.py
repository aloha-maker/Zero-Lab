import math

HP_BASE_ADDITION = 10
OTHER_STAT_BASE_ADDITION = 5

def calculate_real_status(is_hp: bool, base_stat: int, iv: int, ev: int, level: int, nature_modifier: float) -> int:
    """
    ステータス実数値を計算する純粋な関数
    """
    base_calc = math.trunc((base_stat * 2 + iv) * level / 100) + ev
    
    if is_hp:
        # HPの計算式
        real_stat = base_calc + level + HP_BASE_ADDITION
    else:
        # HP以外の計算式
        real_stat = math.trunc((base_calc + OTHER_STAT_BASE_ADDITION) * nature_modifier)
        
    return real_stat