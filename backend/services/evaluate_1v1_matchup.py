# backend/services/evaluate_1v1_matchup.py
import asyncio
from typing import Dict, List

from core.supabase import SupabaseClient
from schemas.evaluate_1v1_matchup import Step2Request, Step2Response, FilteredPokemon
from schemas.pokemon import PokemonInfo, SeasonMoveInfo, SeasonPokemonInfo
from .strategy import MatrixService
from .pokemon_season import get_active_season_pokemon_details
from .pokemon_detail import fetch_pokemon_data

# 使用率データ（top_evs/top_nature）を持たないポケモンに適用するデフォルト値
DEFAULT_EVS = {"hp": 0, "attack": 0, "defense": 0, "sp_attack": 0, "sp_defense": 0, "speed": 0}
DEFAULT_NATURE = "まじめ"


def _to_season_pokemon(info: PokemonInfo, rank: int) -> SeasonPokemonInfo:
    """
    fetch_pokemon_data() が返す PokemonInfo（種族値・技のみ）を、
    MatrixService._simulate_subject_vs_environment が要求する
    SeasonPokemonInfo 形式に変換するアダプター。

    all_environment_pokemons（シーズンの使用率データ）に存在しない
    ポケモンのみ、このフォールバック経路を通る。
    使用率ランキングデータ（top_evs / top_nature）は持っていないため、
    無振り・まじめ をデフォルトとして採用する。
    """
    season_moves = [
        SeasonMoveInfo(
            move_name=m.name,
            move_type=m.type,
            category=m.damage_class,
            power=m.power,
        )
        for m in info.moves
    ]

    return SeasonPokemonInfo(
        **info.model_dump(),
        rank=rank,
        season_moves=season_moves,
        season_natures=[],
        season_evs=[],
        max_power_times_atk_by_type={},
        type_efficacies={},
        top_nature=DEFAULT_NATURE,
        top_evs=DEFAULT_EVS,
        top_ability="",  # ← 追加: Pydanticのバリデーションエラー回避用
    )


async def execute_step2_filtering(
    req: Step2Request,
    supabase: SupabaseClient
) -> Step2Response:
    filtered_list: List[FilteredPokemon] = []

    # 1. 候補ポケモンと敵ポケモンの「名前」をすべて抽出し、重複を排除
    candidate_names = [c.name for c in req.candidates]
    target_names = [t.opponent_name for t in req.targets]
    all_pokemon_names = list(set(candidate_names + target_names))

    # 2. まずシーズン環境データ（技・top_evs・top_nature・rank を正式に持つ）から引く
    all_environment_pokemons = await get_active_season_pokemon_details(supabase)
    environment_map: Dict[str, SeasonPokemonInfo] = {
        p.name: p for p in all_environment_pokemons
    }

    season_pokemon_map: Dict[str, SeasonPokemonInfo] = {}
    missing_names: List[str] = []
    for name in all_pokemon_names:
        if name in environment_map:
            season_pokemon_map[name] = environment_map[name]
        else:
            missing_names.append(name)

    # 3. 環境データに存在しない名前のみ、pokemon_detail.py で個別取得しアダプター変換
    if missing_names:
        fetch_tasks = [fetch_pokemon_data(supabase, name) for name in missing_names]
        raw_results = await asyncio.gather(*fetch_tasks, return_exceptions=True)

        rank_by_name: Dict[str, int] = {c.name: c.rank for c in req.candidates}
        rank_by_name.update({t.opponent_name: t.opponent_rank for t in req.targets})

        for name, res in zip(missing_names, raw_results):
            if isinstance(res, Exception):
                continue
            season_pokemon_map[name] = _to_season_pokemon(res, rank_by_name.get(name, 0))

    # 4. 必要なタイプ相性データを一括取得（候補・敵、両方の技タイプをまとめて集約）
    all_moves_parsed_groups = [
        [m.model_dump() for m in p.season_moves]
        for p in season_pokemon_map.values()
    ]
    type_data_map = await MatrixService._build_type_data_map(
        supabase,
        all_moves_parsed_groups,
        [],  # 敵側の技タイプも上のgroupsに含めているため空でよい
    )

    target_season_pokemons = [
        season_pokemon_map[name] for name in target_names if name in season_pokemon_map
    ]

    # 5. 候補ごとに、「候補 vs targets」で MatrixService の判定ロジックを実行
    for candidate in req.candidates:
        subject = season_pokemon_map.get(candidate.name)
        if not subject:
            continue

        subject_real_stats = MatrixService._calculate_real_stats(
            subject.base_stats, subject.top_evs, subject.top_nature
        )
        subject_moves_parsed = [m.model_dump() for m in subject.season_moves]

        matrix = MatrixService._simulate_subject_vs_environment(
            subject_name=candidate.name,
            subject_real_stats=subject_real_stats,
            subject_types=subject.types,
            subject_moves_parsed=subject_moves_parsed,
            subject_ability=subject.top_ability,  # ← 追加: 対象ポケモンの特性を渡す
            active_environment_pokemons=target_season_pokemons,
            type_data_map=type_data_map,
            verbose=True,
        )

        # 判定が ◎ または ◯ の場合、有利な相手として記録
        good_against = [
            row.opponent_name for row in matrix if row.judgment in ["◎", "◯"]
        ]

        # すべてに対して「△」か「×」ではない（＝有利な相手が1体以上いる）なら残す
        if len(good_against) > 0:
            filtered_list.append(FilteredPokemon(
                id=candidate.id,
                name=candidate.name,
                types=candidate.types,
                rank=candidate.rank,
                good_matchups=good_against
            ))

    return Step2Response(filtered_candidates=filtered_list)