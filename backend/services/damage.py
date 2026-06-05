import math

# 今後の拡張を見据えた定数化
STAB_MULTIPLIER = 1.5
MIN_DAMAGE_ROLL = 85
MAX_DAMAGE_ROLL = 100

def calculate_pokemon_damage(level: int, power: int, attack: int, defense: int, is_stab: bool, effectiveness: float) -> tuple[int, int]:
    """
    ダメージの最小値・最大値を計算する純粋な関数
    """
    step1 = math.trunc(2 * level / 5) + 2
    step2 = math.trunc(step1 * power * attack / defense)
    base_damage = math.trunc(step2 / 50) + 2
    
    if is_stab:
        base_damage = math.trunc(base_damage * STAB_MULTIPLIER)
        
    base_damage = math.trunc(base_damage * effectiveness)
    
    min_damage = math.trunc(base_damage * MIN_DAMAGE_ROLL / 100)
    max_damage = math.trunc(base_damage * MAX_DAMAGE_ROLL / 100)
    
    return min_damage, max_damage