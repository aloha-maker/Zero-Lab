import os
from supabase import create_client, Client
import asyncio
from typing import List
from schemas.seasons import TypeVulnerabilityResult, SeasonPokemonInfo
from services.type_matchup import fetch_type_data, calculate_multiplier_and_message

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

async def calculate_most_vulnerable_defense_types(
    detailed_pokemons: List[SeasonPokemonInfo]
) -> List[TypeVulnerabilityResult]:
    """
    【要件達成】
    1. 防御側（自分）の単タイプ18通りを準備
    2. 50位までのポケモンの技火力（物理・特殊を考慮済みの数値）× タイプ相性をループで回す
    3. タイプごとに集計して、不利な順（総ダメージが多い順）にソートして返す
    """
    # ランキング50位までのポケモンに絞り込む
    top_50_pokemons = detailed_pokemons[:50]
    
    # 1. 18タイプそれぞれの合計倍率を記録する辞書を初期化
    total_efficacy_by_def_type = {t: 0.0 for t in ALL_TYPES_JA}

    # 2. 50位までのポケモンをループ
    for poke in top_50_pokemons:
        # ポケモンが既に持っている相性データ（日本語キー）を取得
        efficacies = poke.type_efficacies
        
        # 3. 防御側の18タイプそれぞれに対して、このポケモンから受ける倍率を足していく
        for def_type_ja in ALL_TYPES_JA:
            # 万が一キーが存在しない場合は等倍(1.0)として扱うガード
            multiplier = efficacies.get(def_type_ja, 1.0)
            
            # 純粋にタイプ相性の倍率（2.0や0.5など）をそのまま合計する
            total_efficacy_by_def_type[def_type_ja] += multiplier
        print(total_efficacy_by_def_type)

    # 合計倍率が高い順（＝弱点を突かれやすく環境的に不利な順）にソート
    sorted_results = sorted(total_efficacy_by_def_type.items(), key=lambda x: x[1], reverse=True)
    
    results = []
    for index, (t, score) in enumerate(sorted_results):
        
        # 💡 各ポケモンの耐久指数（前回のループで計算済みの値）を合計する、
        # もしくは50位までの平均等のアプローチがありますが、
        # ここでは「このタイプ（自分）が、50位のポケモン達から受ける合計の被ダメージリスクの絶対値」を算出するため、
        # 各ポケモンの耐久力（指数）の総和をベースに掛け算を行います。
        total_hp_times_def = sum(p.base_stats.get("hp_times_defense", 0) for p in top_50_pokemons)
        total_hp_times_sp_def = sum(p.base_stats.get("hp_times_sp_defense", 0) for p in top_50_pokemons)
        
        # 💡 相性倍率の合計（score） × 50位までのポケモンの防御指数の平均（または総和）
        # ※ 値が大きくなりすぎないよう、10000等で割って指数化（マイルドな数値に）するのがUI上見やすいためおすすめです。
        phys_index = int((score * total_hp_times_def) / 10000)
        spec_index = int((score * total_hp_times_sp_def) / 10000)

        results.append(TypeVulnerabilityResult(
            defense_type=t,
            total_damage_risk=int(score * 100), # 相性合計（100倍）
            physical_risk_index=phys_index,      # 💡【追加】物理被ダメリスク指数
            special_risk_index=spec_index,       # 💡【追加】特殊被ダメリスク指数
            rank=index + 1
        ))
    return results