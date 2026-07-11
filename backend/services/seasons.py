import asyncio
from typing import List

from core.supabase import SupabaseClient
from schemas.seasons import RealDamageRankingResult, SeasonPokemonInfo
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
    """
    【環境通りが良い技ランキング】
    攻撃側：全ポケモンの全攻撃技
    防御側：上位50位のポケモンごとに「耐久指数 ÷ 相性倍率」を個別に計算し、それを50匹分足し合わせる。
          （相性倍率が大きければ大きいほど、そのポケモンの防御壁は薄くなり、総防御指数が小さくなります）
          （無効の場合は対象ポケモン自身の耐久値に関わらず、固定の巨大な防御指数を加算する）
    """
    top_50_defenders = all_pokemons[:50]

    # 💡 修正5: 防衛側50匹の「タイプリスト・物理耐久指数・特殊耐久指数」を
    # 攻撃技ループに入る前に一度だけ計算し、軽量なリストとして保持する。
    # こうすることで、攻撃技×防衛側のネストループ内で
    # defender.base_stats.get(...) を毎回呼び出すオーバーヘッドを避けられる。
    precomputed_defenders = [
        (
            defender.types,
            defender.base_stats.get("hp_times_defense", 1),
            defender.base_stats.get("hp_times_sp_defense", 1),
        )
        for defender in top_50_defenders
    ]

    # 💡 修正1: 英語への変換辞書処理をすべて削除し、使用されている技のタイプ(日本語)だけを抽出
    unique_move_types = set()
    for attacker in all_pokemons:
        for move in attacker.season_moves:
            if move.move_type:
                unique_move_types.add(move.move_type)
    
    # 💡 修正2: supabaseクライアントを渡し、日本語で直接DBから相性データを取得
    type_data_tasks = [fetch_type_data(supabase, t_ja) for t_ja in unique_move_types]
    type_data_results = await asyncio.gather(*type_data_tasks)
    
    # 日本語のタイプ名をキーにした辞書を作成
    type_data_map = dict(zip(unique_move_types, type_data_results))
    
    all_damage_scenarios = []

    for attacker in all_pokemons:
        for move in attacker.season_moves:
            if not move.power_times_atk or move.power_times_atk == 0:
                continue
                
            # 💡 修正3: 日本語の技タイプでそのままデータを取得
            t_data = type_data_map.get(move.move_type)
            if not t_data:
                continue

            total_weighted_defense = 0.0

            # カテゴリ（物理/特殊）に応じて使用する耐久指数を技ループの外側で確定
            is_physical = move.category == "物理"

            for defender_types, hp_def, hp_spdef in precomputed_defenders:
                # 💡 修正4: 防御側のタイプ(日本語のリスト)をそのまま渡すだけでOK！
                multiplier, _ = calculate_multiplier_and_message(t_data, defenders=defender_types)

                # 事前計算済みの耐久指数を利用（defender.base_stats.get(...) の毎回呼び出しを回避）
                individual_def_index = hp_def if is_physical else hp_spdef

                # 倍率が高い（弱点）ほど、分母の防御壁を小さく（薄く）する
                if multiplier > 0:
                    total_weighted_defense += (individual_def_index / multiplier)
                else:
                    # 無効（0倍）の場合：「この技はこの1匹には全くダメージが通らない」
                    # という事実を、対象の耐久値の大小に関わらず一律の固定値
                    # (IMMUNE_DEFENSE_PENALTY) で反映する。
                    # ※ individual_def_index を掛けてしまうと、たまたま高耐久な
                    #   無効持ちが混ざった場合にランキングが不自然に歪むため、
                    #   意図的に対象の耐久値を計算に含めない。
                    total_weighted_defense += IMMUNE_DEFENSE_PENALTY

            # 整数にキャストして最終的な「総防御指数」とする
            defense_index = int(total_weighted_defense)

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