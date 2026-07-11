# backend/services/status.py
import math
from typing import Dict

HP_BASE_ADDITION = 10
OTHER_STAT_BASE_ADDITION = 5

# 全25種類の性格補正値マッピング
NATURE_MODIFIERS: Dict[str, Dict[str, float]] = {
    # 無補正
    "てれや":   {"hp": 1.0, "attack": 1.0, "defense": 1.0, "sp_attack": 1.0, "sp_defense": 1.0, "speed": 1.0},
    "がんばりや":{"hp": 1.0, "attack": 1.0, "defense": 1.0, "sp_attack": 1.0, "sp_defense": 1.0, "speed": 1.0},
    "すなお":   {"hp": 1.0, "attack": 1.0, "defense": 1.0, "sp_attack": 1.0, "sp_defense": 1.0, "speed": 1.0},
    "きまぐれ": {"hp": 1.0, "attack": 1.0, "defense": 1.0, "sp_attack": 1.0, "sp_defense": 1.0, "speed": 1.0},
    "まじめ":   {"hp": 1.0, "attack": 1.0, "defense": 1.0, "sp_attack": 1.0, "sp_defense": 1.0, "speed": 1.0},
    # 攻撃（A）上昇
    "さみしがり":{"hp": 1.0, "attack": 1.1, "defense": 0.9, "sp_attack": 1.0, "sp_defense": 1.0, "speed": 1.0},
    "いじっぱり":{"hp": 1.0, "attack": 1.1, "defense": 1.0, "sp_attack": 0.9, "sp_defense": 1.0, "speed": 1.0},
    "やんちゃ": {"hp": 1.0, "attack": 1.1, "defense": 1.0, "sp_attack": 1.0, "sp_defense": 0.9, "speed": 1.0},
    "ゆうかん": {"hp": 1.0, "attack": 1.1, "defense": 1.0, "sp_attack": 1.0, "sp_defense": 1.0, "speed": 0.9},
    # 防御（B）上昇
    "ずぶとい": {"hp": 1.0, "attack": 0.9, "defense": 1.1, "sp_attack": 1.0, "sp_defense": 1.0, "speed": 1.0},
    "わんぱく": {"hp": 1.0, "attack": 1.0, "defense": 1.1, "sp_attack": 0.9, "sp_defense": 1.0, "speed": 1.0},
    "のうてんき":{"hp": 1.0, "attack": 1.0, "defense": 1.1, "sp_attack": 1.0, "sp_defense": 0.9, "speed": 1.0},
    "のんき":   {"hp": 1.0, "attack": 1.0, "defense": 1.1, "sp_attack": 1.0, "sp_defense": 1.0, "speed": 0.9},
    # 特攻（C）上昇
    "ひかえめ": {"hp": 1.0, "attack": 0.9, "defense": 1.0, "sp_attack": 1.1, "sp_defense": 1.0, "speed": 1.0},
    "おっとり": {"hp": 1.0, "attack": 1.0, "defense": 0.9, "sp_attack": 1.1, "sp_defense": 1.0, "speed": 1.0},
    "うっかりや":{"hp": 1.0, "attack": 1.0, "defense": 1.0, "sp_attack": 1.1, "sp_defense": 0.9, "speed": 1.0},
    "れいせい": {"hp": 1.0, "attack": 1.0, "defense": 1.0, "sp_attack": 1.1, "sp_defense": 1.0, "speed": 0.9},
    # 特防（D）上昇
    "おだやか": {"hp": 1.0, "attack": 0.9, "defense": 1.0, "sp_attack": 1.0, "sp_defense": 1.1, "speed": 1.0},
    "おとなしい":{"hp": 1.0, "attack": 1.0, "defense": 0.9, "sp_attack": 1.0, "sp_defense": 1.1, "speed": 1.0},
    "しんちょう":{"hp": 1.0, "attack": 1.0, "defense": 1.0, "sp_attack": 0.9, "sp_defense": 1.1, "speed": 1.0},
    "なまいき": {"hp": 1.0, "attack": 1.0, "defense": 1.0, "sp_attack": 1.0, "sp_defense": 1.1, "speed": 0.9},
    # 素早さ（S）上昇
    "おくびょう":{"hp": 1.0, "attack": 0.9, "defense": 1.0, "sp_attack": 1.0, "sp_defense": 1.0, "speed": 1.1},
    "せっかち": {"hp": 1.0, "attack": 1.0, "defense": 0.9, "sp_attack": 1.0, "sp_defense": 1.0, "speed": 1.1},
    "ようき":   {"hp": 1.0, "attack": 1.0, "defense": 1.0, "sp_attack": 0.9, "sp_defense": 1.0, "speed": 1.1},
    "むじゃき": {"hp": 1.0, "attack": 1.0, "defense": 1.0, "sp_attack": 1.0, "sp_defense": 0.9, "speed": 1.1},
}

DEFAULT_NATURE = {"hp": 1.0, "attack": 1.0, "defense": 1.0, "sp_attack": 1.0, "sp_defense": 1.0, "speed": 1.0}

def calculate_real_status(is_hp: bool, base_stat: int, iv: int, ev: int, level: int, nature_name: str, stat_key: str) -> int:
    """
    ステータス実数値を計算する関数
    
    Args:
        is_hp (bool): HPの計算かどうか
        base_stat (int): 種族値
        iv (int): 個体値
        ev (int): 努力値
        level (int): レベル
        nature_name (str): 性格名 (例: "いじっぱり")
        stat_key (str): 計算対象のステータスキー (例: "attack", "speed")
    """
    # 1. 渡された性格名から辞書を取得（不正な値ならデフォルト無補正）
    nature_map = NATURE_MODIFIERS.get(nature_name, DEFAULT_NATURE)
    
    # 2. 対象ステータスの補正値（倍率）を取得
    nature_modifier = nature_map.get(stat_key, 1.0)
    
    # 3. 計算実行
    base_calc = math.trunc((base_stat * 2 + iv) * level / 100) + ev
    
    if is_hp:
        # HPの計算式
        real_stat = base_calc + level + HP_BASE_ADDITION
    else:
        # HP以外の計算式
        real_stat = math.trunc((base_calc + OTHER_STAT_BASE_ADDITION) * nature_modifier)
        
    return real_stat