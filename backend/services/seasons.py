import os
from supabase import create_client, Client
import asyncio
from typing import List
from schemas.seasons import RealDamageRankingResult, SeasonPokemonInfo
from .type_matchup import fetch_type_data, calculate_multiplier_and_message

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# 英語 ⇄ 日本語のマッピング辞書
TYPE_ENG_TO_JA = {
    "normal": "ノーマル", "fire": "ほのお", "water": "みず", 
    "electric": "でんき", "grass": "くさ", "ice": "こおり", 
    "fighting": "かくとう", "poison": "どく", "ground": "じめん", 
    "flying": "ひこう", "psychic": "エスパー", "bug": "むし", 
    "rock": "いわ", "ghost": "ゴースト", "dragon": "ドラゴン", 
    "dark": "あく", "steel": "はがね", "fairy": "フェアリー"
}
ALL_TYPES_JA = list(TYPE_ENG_TO_JA.values())

def get_all_seasons() -> list[dict]:
    """
    データベースからシーズンの一覧を取得する。
    紐づく rules テーブルの情報も合わせて返却する。

    Returns:
        list[dict]: シーズン情報のリスト（rule オブジェクト含む）
    """
    try:
        # rules テーブルを内部結合し、ルール情報を "rule" キーにネストして返す
        response = (
            supabase.table("seasons")
            .select("*, rule:rules(*)")
            .order("start_date", desc=True)
            .execute()
        )
        return response.data

    except Exception as e:
        print(f"Error fetching seasons: {e}")
        raise e

async def calculate_real_damage_ranking(
    all_pokemons: List[SeasonPokemonInfo]
) -> List[RealDamageRankingResult]:
    """
    【数式バグ修正版：真の環境通りが良い技ランキング】
    攻撃側：全ポケモンの全攻撃技
    防御側：上位50位のポケモンごとに「耐久指数 ÷ 相性倍率」を個別に計算し、それを50匹分足し合わせる。
          （相性倍率が大きければ大きいほど、そのポケモンの防御壁は薄くなり、総防御指数が小さくなります）
    """
    top_50_defenders = all_pokemons[:50]
    
    # 事前にPokeAPIの相性データを準備（キャッシュ利用で高速）
    type_data_tasks = [fetch_type_data(eng) for eng in TYPE_ENG_TO_JA.keys()]
    type_data_results = await asyncio.gather(*type_data_tasks)
    type_data_map = dict(zip(TYPE_ENG_TO_JA.keys(), type_data_results))
    
    all_damage_scenarios = []

    # 1. 攻撃側：全ポケモンのすべての技をループ
    for attacker in all_pokemons:
        for move in attacker.season_moves:
            if not move.power_times_atk or move.power_times_atk == 0:
                continue
                
            move_type_eng = [eng for eng, ja in TYPE_ENG_TO_JA.items() if ja == move.move_type]
            if not move_type_eng:
                continue
            t_data = type_data_map[move_type_eng[0]]

            # 💡 50位以内のポケモンごとに「実質的な防御壁」を計算して集計
            total_weighted_defense = 0.0
            
            for defender in top_50_defenders:
                # 日本語タイプ名から英語名リストを即席で作成
                def_types_eng = []
                for t_ja in defender.types:
                    eng_list = [e for e, j in TYPE_ENG_TO_JA.items() if j == t_ja]
                    if eng_list:
                        def_types_eng.append(eng_list[0])
                
                # 防御側1匹に対する正確な相性倍率（4倍、2倍、1倍、0.5倍、0倍）を計算
                multiplier, _ = calculate_multiplier_and_message(t_data, defenders=def_types_eng)

                # カテゴリ（物理/特殊）に応じた、このポケモン固有の耐久指数を取得
                if move.category == "物理":
                    individual_def_index = defender.base_stats.get("hp_times_defense", 1)
                else:
                    individual_def_index = defender.base_stats.get("hp_times_sp_defense", 1)
                
                # 💡【バグ修正箇所】
                # 倍率が高い（弱点）ほど、分母の防御壁を小さく（薄く）する
                # 倍率が0（無効）の場合は、実質防御壁が無限大（ダメージが通らない）になるため、巨大な数値を足すかスキップ
                if multiplier > 0:
                    total_weighted_defense += (individual_def_index / multiplier)
                else:
                    # 💡 無効（0倍）の場合は、50位以内のポケモンの最大耐久を遥かに超える巨大な壁（実質無敵）として加算
                    total_weighted_defense += (individual_def_index * 100)

            # 整数にキャストして最終的な「総防御指数」とする
            defense_index = int(total_weighted_defense)

            # 実質被ダメ指数（環境突破力）＝ 火力指数 ÷ 防御指数
            # 見やすい数値（指数）になるよう100,000倍を掛け算
            if defense_index > 0:
                real_risk = (move.power_times_atk / defense_index) * 100000
                real_damage_percent = round(real_risk, 2)
            else:
                real_damage_percent = 0.0

            all_damage_scenarios.append({
                "pokemon_name": attacker.name,
                "move_name": move.move_name,
                "move_type": move.move_type,
                "category": move.category,
                "power_times_atk": move.power_times_atk,
                "defense_index": defense_index,
                "real_damage_percent": real_damage_percent
            })

    # 実質被ダメ指数（通りの良さ）が大きい順にソート
    sorted_scenarios = sorted(all_damage_scenarios, key=lambda x: x["real_damage_percent"], reverse=True)

    # 上位50件を最終結果として成形
    results = [
        RealDamageRankingResult(
            rank=index + 1,
            pokemon_name=item["pokemon_name"],
            move_name=item["move_name"],
            move_type=item["move_type"],
            category=item["category"],
            power_times_atk=item["power_times_atk"],
            defense_index=item["defense_index"],
            real_damage_percent=item["real_damage_percent"]
        )
        for index, item in enumerate(sorted_scenarios[:50])
    ]

    return results