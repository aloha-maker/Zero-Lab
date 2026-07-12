import asyncio
from typing import List

from core.supabase import SupabaseClient
from schemas.seasons import RealDamageRankingResult, SeasonPokemonInfo
from .matchup_core import calculate_effective_defense_index, calculate_damage_risk
from .type_matchup import fetch_type_data, calculate_multiplier_and_message

def get_all_seasons(supabase: SupabaseClient) -> list[dict]:
    """
    データベースからシーズンの一覧を取得する。
    紐づく rules テーブルの情報も合わせて返却する。

    Args:
        supabase (SupabaseClient): 注入されたSupabaseクライアント

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


# 💡 修正6: 「無効（0倍）」時に加算する防御指数は、対象ポケモン自身の耐久値
# （individual_def_index）に依存しない固定値とする。
# 個体の耐久値に比例させてしまうと、たまたま上位50位に高耐久な「無効持ち」が
# いた場合にその1匹だけの影響が突出し、他の49匹に対する通りの良さの差が
# 埋もれてしまい、ランキング順位が意図せず入れ替わる恐れがあるため。
# ここでは「無効＝一切ダメージが通らない」という事実だけを、耐久値の大小に
# 関わらず一律・十分に大きい値として反映する。
IMMUNE_DEFENSE_PENALTY = 10_000_000


async def calculate_real_damage_ranking(
    supabase: SupabaseClient,
    all_pokemons: List[SeasonPokemonInfo]
) -> List[RealDamageRankingResult]:
    top_50_defenders = all_pokemons[:50] #[cite: 8]

    precomputed_defenders = [ #[cite: 8]
        (
            defender.types, #[cite: 8]
            defender.base_stats.get("hp_times_defense", 1), #[cite: 8]
            defender.base_stats.get("hp_times_sp_defense", 1), #[cite: 8]
        )
        for defender in top_50_defenders #[cite: 8]
    ]

    unique_move_types = set() #[cite: 8]
    for attacker in all_pokemons: #[cite: 8]
        for move in attacker.season_moves: #[cite: 8]
            if move.move_type: #[cite: 8]
                unique_move_types.add(move.move_type) #[cite: 8]
    
    type_data_tasks = [fetch_type_data(supabase, t_ja) for t_ja in unique_move_types] #[cite: 8]
    type_data_results = await asyncio.gather(*type_data_tasks) #[cite: 8]
    type_data_map = dict(zip(unique_move_types, type_data_results)) #[cite: 8]
    
    all_damage_scenarios = [] #[cite: 8]

    for attacker in all_pokemons: #[cite: 8]
        for move in attacker.season_moves: #[cite: 8]
            if not move.power_times_atk or move.power_times_atk == 0: #[cite: 8]
                continue #[cite: 8]
                
            t_data = type_data_map.get(move.move_type) #[cite: 8]
            if not t_data: #[cite: 8]
                continue #[cite: 8]

            total_weighted_defense = 0.0 #[cite: 8]
            is_physical = move.category == "物理" #[cite: 8]

            for defender_types, hp_def, hp_spdef in precomputed_defenders: #[cite: 8]
                multiplier, _ = calculate_multiplier_and_message(t_data, defenders=defender_types) #[cite: 8]

                # ★ 修正ポイント：切り出した共通ロジックを使用
                effective_def = calculate_effective_defense_index(
                    is_physical=is_physical,
                    multiplier=multiplier,
                    hp_def=hp_def,
                    hp_spdef=hp_spdef
                )
                total_weighted_defense += effective_def

            defense_index = int(total_weighted_defense) #[cite: 8]

            # ★ 修正ポイント：切り出した共通ロジックを使用
            real_damage_percent = round(calculate_damage_risk(move.power_times_atk, defense_index), 2)

            all_damage_scenarios.append({ #[cite: 8]
                "pokemon_name": attacker.name, #[cite: 8]
                "move_name": move.move_name, #[cite: 8]
                "move_type": move.move_type, #[cite: 8]
                "category": move.category, #[cite: 8]
                "power_times_atk": move.power_times_atk, #[cite: 8]
                "defense_index": defense_index, #[cite: 8]
                "real_damage_percent": real_damage_percent #[cite: 8]
            })

    sorted_scenarios = sorted(all_damage_scenarios, key=lambda x: x["real_damage_percent"], reverse=True) #[cite: 8]

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