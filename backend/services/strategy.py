# backend/services/strategy.py
import math
import asyncio
import logging
from typing import List, Dict, Any, Tuple, Optional
from core.supabase import SupabaseClient
from services.status import calculate_real_status
from services.type_matchup import fetch_type_data, calculate_multiplier_and_message
from services.pokemon_season import get_active_season_pokemon_details
from schemas.strategy import (
    AutoMatrixRequest, MatrixResponse, MatrixResultRow,
    AdvantageJudgment, DisadvantageCategory, ActionOrder,
    BulkMatrixRequest, BulkMatrixResponse, CandidateMatrixResult,
    OneVsOneResponse, OneVsOneRequest,
)

logger = logging.getLogger(__name__)

# H/A/B/C/D/S（フロント/リクエスト表記） ⇔ hp/attack/defense/sp_attack/sp_defense/speed（内部キー）
STAT_KEY_MAP = {"H": "hp", "A": "attack", "B": "defense", "C": "sp_attack", "D": "sp_defense", "S": "speed"}

# 行動保障（通称：眠り粉・鬼火等の妨害）を持つ、機能停止判定の対象となる相手
# NOTE: 現状は運用上の理由で無効化中（空リスト）。将来的には固定名リストではなく、
#       取得済み技データ（moves_parsed）から状態異常技の有無を動的判定する方式への
#       移行を検討したい（環境が変わるたびにコードを直す必要がなくなるため）。
STATUS_THREAT_POKEMON_NAMES = []  # "ディンルー", "キョジオーン", "カバルドン", "ドヒドイデ"

# 環境トップポケモンのデフォルト取得順位上限
DEFAULT_ENV_RANK_LIMIT = 30

# ダメージ計算の前提となる対戦レベル（シングルバトルのランクマ準拠）
BATTLE_LEVEL = 50

# タイプ一致補正（STAB）
STAB_MULTIPLIER = 1.5

# 乱数ダメージの最低値（16段階中の最低ロール）。
# 本サービスは常に「最悪乱数（下振れ）」でターン数を計算する設計としている。
# これは有利不利判定を安全側（＝相手を過小評価しない方向）に倒すための意図的な選択。
MIN_DAMAGE_ROLL = 0.85

# schemas/pokemon.py で確認された、技データの実際の2つのスキーマ:
#
#   ① SeasonPokemonInfo.season_moves (SeasonMoveInfo) ※本命・優先データ
#        move_name / move_type / category（値は日本語 "物理"/"特殊"/"変化"）
#        get_active_season_pokemon_details() 経由でのみ取得可能。
#
#   ② PokemonInfo.moves (PokemonMoveDetail) ※フォールバック用の簡易データ
#        name / type / damage_class（値は英語 "physical"/"special"/"status"、PokeAPI由来）
#        season_moves を持たない個別取得（fetch_pokemon_data）でも存在しうる。
#
# strategy.py内部では、上記どちらのソースから来た技データでも同じロジックで扱えるよう、
# 以下の内部標準フォーマットに正規化してから使用する（_extract_normalized_moves参照）。
#   { MOVE_KEY_NAME: str, MOVE_KEY_TYPE: str, MOVE_KEY_DAMAGE_CLASS: "physical"|"special"|"status", "power": int|None }
MOVE_KEY_NAME = "name"
MOVE_KEY_TYPE = "type"
MOVE_KEY_DAMAGE_CLASS = "damage_class"
DAMAGE_CLASS_STATUS = "status"
DAMAGE_CLASS_PHYSICAL = "physical"

# SeasonMoveInfo.category（日本語）→ 内部標準の damage_class（英語）への変換マップ
SEASON_CATEGORY_TO_DAMAGE_CLASS = {
    "物理": DAMAGE_CLASS_PHYSICAL,
    "特殊": "special",
    "変化": DAMAGE_CLASS_STATUS,
}


# H/A/B/C/D/S（フロント/リクエスト表記） ⇔ hp/attack/defense/sp_attack/sp_defense/speed（内部キー）
STAT_KEY_MAP = {"H": "hp", "A": "attack", "B": "defense", "C": "sp_attack", "D": "sp_defense", "S": "speed"}

# --- 新規追加: 特性によるダメージ無効化マッピング ---
# 防御側の特性名 : 無効化される攻撃技のタイプ
IMMUNITY_ABILITIES = {
    "ふゆう": ["じめん"],
    "もらいび": ["ほのお"],
    "ちょすい": ["みず"],
    "よびみず": ["みず"],
    "そうしょく": ["くさ"],
    "ちくでん": ["でんき"],
    "ひらいしん": ["でんき"],
}

class MatrixService:
    @staticmethod
    async def _fetch_all_season_pokemons(supabase: SupabaseClient) -> list:
        """
        現行シーズンの全ポケモンデータ（ランク上限なし）を取得します。
        season_moves はこの経路でしか取得できないため、
        個別ポケモン検索（主軸・1vs1等）でもまずここから探すこと。
        """
        try:
            return await get_active_season_pokemon_details(supabase)
        except Exception as e:
            logger.error("シーズンポケモンデータの取得中にエラーが発生しました: %s", e, exc_info=True)
            raise ValueError(f"シーズンポケモンデータの取得に失敗しました。詳細: {e}") from e

    @staticmethod
    async def _fetch_top_environment_pokemons(supabase: SupabaseClient, limit: int = DEFAULT_ENV_RANK_LIMIT) -> list:
        """
        環境上位のポケモンを非同期で一括取得します。
        """
        all_season_pokemons = await MatrixService._fetch_all_season_pokemons(supabase)
        return [
            opp for opp in all_season_pokemons if opp.rank <= limit
        ]

    @staticmethod
    def _convert_evs_to_internal(evs_dict: dict) -> dict:
        """
        H/A/B/C/D/S表記（フロント/リクエスト）のEVs辞書を、
        hp/attack/defense/sp_attack/sp_defense/speed表記（内部キー）に変換します。
        """
        return {
            internal_key: int(evs_dict.get(api_key, 0))
            for api_key, internal_key in STAT_KEY_MAP.items()
        }

    @staticmethod
    def _get_field(data: Any, field_name: str, default: Any = None) -> Any:
        """
        dict・Pydanticモデル・その他オブジェクトのいずれであっても、
        統一的にフィールド値を取得します。

        NOTE: 「hasattr(data, field) を先に見て、Falseならdata.get(field)を呼ぶ」
              という書き方は、フィールド自体を持たないPydanticモデル（.get未実装）
              に対しては AttributeError でクラッシュするため使わないこと。
              ここでは dict かどうかだけを判定し、それ以外は getattr(default付き) に
              一本化することで、フィールドの有無に関わらず安全に既定値へフォールバックする。
        """
        if isinstance(data, dict):
            return data.get(field_name, default)
        return getattr(data, field_name, default)

    @staticmethod
    def _normalize_season_move(m: Any) -> dict:
        """SeasonMoveInfo(move_name/move_type/category, categoryは日本語)を内部標準形式に変換"""
        d = m.model_dump() if hasattr(m, 'model_dump') else m
        raw_category = d.get("category")
        return {
            MOVE_KEY_NAME: d.get("move_name"),
            MOVE_KEY_TYPE: d.get("move_type"),
            MOVE_KEY_DAMAGE_CLASS: SEASON_CATEGORY_TO_DAMAGE_CLASS.get(raw_category, raw_category),
            "power": d.get("power"),
        }

    @staticmethod
    def _normalize_pokemon_move_detail(m: Any) -> dict:
        """PokemonMoveDetail(name/type/damage_class, damage_classは英語)を内部標準形式に変換"""
        d = m.model_dump() if hasattr(m, 'model_dump') else m
        return {
            MOVE_KEY_NAME: d.get("name"),
            MOVE_KEY_TYPE: d.get("type"),
            MOVE_KEY_DAMAGE_CLASS: d.get("damage_class"),
            "power": d.get("power"),
        }

    @staticmethod
    def _extract_normalized_moves(pokemon_data: Any) -> List[dict]:
        """
        技データを season_moves（SeasonMoveInfo）優先で取得し、内部標準形式に正規化して返す。
        season_moves が無い場合のみ、簡易データの moves（PokemonMoveDetail）にフォールバックする。
        後者はランキング1位の技構成とは限らない点に注意（データソースが異なる）。
        """
        raw_season_moves = MatrixService._get_field(pokemon_data, 'season_moves', []) or []
        if raw_season_moves:
            return [MatrixService._normalize_season_move(m) for m in raw_season_moves]

        raw_moves = MatrixService._get_field(pokemon_data, 'moves', []) or []
        if raw_moves:
            pokemon_name = MatrixService._get_field(pokemon_data, 'name')
            logger.warning(
                "%s は season_moves が無いため、簡易技データ(moves)にフォールバックしました。"
                "ランキング1位の技構成とは異なる可能性があります。",
                pokemon_name,
            )
            return [MatrixService._normalize_pokemon_move_detail(m) for m in raw_moves]

        return []

    @staticmethod
    def _prepare_battle_params(pokemon_data: Any, evs_internal: dict, nature_name: str, requested_ability: Optional[str] = None) -> Tuple[dict, list, list, str]:
        """
        1体分のポケモンデータ、努力値(内部キー)、性格、特性から、
        シミュレーションに必要な実数値・タイプ一覧・パース済み技データ・特性を生成します。
        """
        base_stats = MatrixService._get_field(pokemon_data, 'base_stats', {})
        real_stats = MatrixService._calculate_real_stats(base_stats, evs_internal, nature_name)

        types = MatrixService._get_field(pokemon_data, 'types', [])

        moves_parsed = MatrixService._extract_normalized_moves(pokemon_data)

        if not moves_parsed:
            pokemon_name = MatrixService._get_field(pokemon_data, 'name')
            logger.debug(
                "技データが空でした（pokemon=%s, data_type=%s）。"
                "season_moves・moves のどちらも取得できていません。",
                pokemon_name, type(pokemon_data).__name__,
            )

        # --- 新規追加: 特性の抽出 ---
        # リクエストで指定された特性があればそれを優先、なければ取得データの1つ目の特性を利用
        ability = requested_ability
        if not ability:
            ability = MatrixService._get_field(pokemon_data, 'top_ability', "")

        return real_stats, types, moves_parsed, ability

    @staticmethod
    async def generate_auto_matrix(request: AutoMatrixRequest, supabase: SupabaseClient) -> MatrixResponse:
        """
        Supabaseのデータを用いて
        有利不利マトリクスを完全自動実行・機械的判定します。
        （主軸ポケモン1体・手動EVs指定 向け）
        """
        # 0. シーズン全件データを取得し、環境トップ50を絞り込む
        all_season_pokemons = await MatrixService._fetch_all_season_pokemons(supabase)
        active_environment_pokemons = [p for p in all_season_pokemons if p.rank <= DEFAULT_ENV_RANK_LIMIT]

        # 1. 主軸ポケモンのデータ補完と実数値計算
        #    season_moves はシーズンデータにしか無いため、まず環境トップ50に限らずシーズン全件から検索する
        main_name = request.main_pokemon_name
        main_base_data = next((p for p in all_season_pokemons if p.name == main_name), None)

        if not main_base_data:
            from services.pokemon_detail import fetch_pokemon_data
            try:
                main_base_data = await fetch_pokemon_data(supabase, main_name)
            except Exception as e:
                raise ValueError(f"ポケモンのデータソースが空です。{e}") from e
            # fetch_pokemon_data は season_moves を含まないため、技データ無しでの計算になる点を明示
            logger.warning(
                "主軸ポケモン(%s)はシーズンのランキングデータに見つからなかったため、"
                "fetch_pokemon_data から基礎データのみ取得しました。技データ(season_moves)が"
                "無いためフォールバック技で計算される可能性があります。",
                main_name,
            )

        # 呼び出し側でEVsと性格の差異を吸収
        request_nature_name = getattr(request, 'nature', 'まじめ')
        evs_dict = request.evs if isinstance(request.evs, dict) else request.evs.model_dump()
        main_evs_internal = MatrixService._convert_evs_to_internal(evs_dict)

        # 共通関数の呼び出し
        main_real_stats, main_types, main_moves_parsed, main_ability = MatrixService._prepare_battle_params(
            pokemon_data=main_base_data,
            evs_internal=main_evs_internal,
            nature_name=request_nature_name,
            requested_ability=getattr(request, 'main_ability', None)
        )

        if not MatrixService._has_valid_attack_move(main_moves_parsed):
            logger.warning(
                "主軸ポケモン(%s)に有効な攻撃技データがありません。フォールバック技で計算します。",
                main_name,
            )

        # 2. 必要なタイプ相性データを一括取得（主軸の技 ＋ 環境全体の技）
        type_data_map = await MatrixService._build_type_data_map(
            supabase, [main_moves_parsed], active_environment_pokemons
        )

        # 3. マッチアップシミュレーション（主軸 vs 環境トップ50）
        results = MatrixService._simulate_subject_vs_environment(
            subject_name=main_name,
            subject_real_stats=main_real_stats,
            subject_types=main_types,
            subject_moves_parsed=main_moves_parsed,
            subject_ability=main_ability,
            active_environment_pokemons=active_environment_pokemons,
            type_data_map=type_data_map,
            verbose=True,
        )

        return MatrixResponse(
            main_pokemon_name=request.main_pokemon_name,
            matrix=results
        )

    @staticmethod
    async def generate_bulk_matrix(request: BulkMatrixRequest, supabase: SupabaseClient) -> BulkMatrixResponse:
        """
        Step2で絞り込んだ候補ポケモン群（10〜30体想定）について、
        環境トップ50とのマトリクスを一括計算します。

        各候補は、主軸のように手動でEVsを指定する代わりに、
        使用率1位の努力値・性格（top_evs / top_nature）を自動採用します。
        環境トップ50データ・タイプ相性データは候補間で1回だけ取得し使い回します。
        """
        # 0. シーズン全件データを取得し、環境トップ50を絞り込む（候補間で共有）
        all_season_pokemons = await MatrixService._fetch_all_season_pokemons(supabase)
        active_environment_pokemons = [p for p in all_season_pokemons if p.rank <= DEFAULT_ENV_RANK_LIMIT]

        # 1. 候補ポケモンのデータ補完
        #    season_moves はシーズンデータにしか無いため、
        #    まず環境トップ50に限らずシーズン全件データから検索し、
        #    それでも見つからない候補のみ個別に取得する（技データ無しになる点に注意）
        candidate_data_map: Dict[str, Any] = {p.name: p for p in all_season_pokemons}

        missing_names = [
            c.name for c in request.candidates if c.name not in candidate_data_map
        ]
        if missing_names:
            from services.pokemon_detail import fetch_pokemon_data
            fetch_tasks = [fetch_pokemon_data(supabase, name) for name in missing_names]
            fetched_results = await asyncio.gather(*fetch_tasks, return_exceptions=True)
            for name, data in zip(missing_names, fetched_results):
                if isinstance(data, Exception):
                    logger.warning("候補ポケモン(%s)のデータ取得に失敗しました: %s", name, data)
                    continue
                logger.warning(
                    "候補ポケモン(%s)はシーズンのランキングデータに見つからなかったため、"
                    "fetch_pokemon_data から基礎データのみ取得しました。技データ(season_moves)が"
                    "無いためフォールバック技で計算される可能性があります。",
                    name,
                )
                candidate_data_map[name] = data

        prepared_candidates_map = {}
        candidate_moves_parsed_list = []
        skipped_candidates = []

        for candidate in request.candidates:
            subject_data = candidate_data_map.get(candidate.name)
            if not subject_data:
                skipped_candidates.append(candidate.name)
                continue

            # 呼び出し側でトップ採用のEVsと性格をセット
            subject_nature = getattr(subject_data, 'top_nature', 'まじめ')
            subject_evs = getattr(subject_data, 'top_evs', {}) or {}

            # 共通関数の呼び出し
            real_stats, types, moves_parsed, ability = MatrixService._prepare_battle_params(
                pokemon_data=subject_data,
                evs_internal=subject_evs,
                nature_name=subject_nature
            )

            if not MatrixService._has_valid_attack_move(moves_parsed):
                logger.warning(
                    "候補ポケモン(%s)に有効な攻撃技データがありません。フォールバック技で計算します。",
                    candidate.name,
                )

            prepared_candidates_map[candidate.name] = {
                "real_stats": real_stats,
                "types": types,
                "moves_parsed": moves_parsed,
                "ability": ability # ← 追加
            }
            candidate_moves_parsed_list.append(moves_parsed)

        if skipped_candidates:
            logger.warning("データが見つからず計算をスキップした候補: %s", skipped_candidates)

        type_data_map = await MatrixService._build_type_data_map(
            supabase, candidate_moves_parsed_list, active_environment_pokemons
        )

        results: List[CandidateMatrixResult] = []

        for candidate in request.candidates:
            params = prepared_candidates_map.get(candidate.name)
            if not params:
                continue

            matrix = MatrixService._simulate_subject_vs_environment(
                subject_name=candidate.name,
                subject_real_stats=params["real_stats"],
                subject_types=params["types"],
                subject_moves_parsed=params["moves_parsed"],
                subject_ability=params["ability"], # ← 追加
                active_environment_pokemons=active_environment_pokemons,
                type_data_map=type_data_map,
                verbose=False,
            )

            results.append(CandidateMatrixResult(
                id=candidate.id,
                name=candidate.name,
                matrix=matrix,
            ))

        return BulkMatrixResponse(results=results)

    # -----------------------------------------------------------------
    # 共通ヘルパー
    # -----------------------------------------------------------------

    @staticmethod
    def _has_valid_attack_move(moves_parsed: List[dict]) -> bool:
        """
        変化技以外の、威力を持つ攻撃技を1つでも持っているかを判定します。
        False の場合、シミュレーションはダミーのフォールバック技で計算されるため、
        呼び出し側で警告ログを出す・結果を「データ不足」として扱う等の対応を推奨します。
        """
        return any(
            m.get(MOVE_KEY_DAMAGE_CLASS) != DAMAGE_CLASS_STATUS and m.get("power")
            for m in moves_parsed
        )

    @staticmethod
    async def _build_type_data_map(
        supabase: SupabaseClient,
        subject_moves_parsed_groups: List[List[dict]],
        active_environment_pokemons: list,
    ) -> Dict[str, Any]:
        all_types_in_env = set()

        for moves_parsed in subject_moves_parsed_groups:
            for m in moves_parsed:
                if m.get(MOVE_KEY_TYPE):
                    all_types_in_env.add(m[MOVE_KEY_TYPE])

        for opp in active_environment_pokemons:
            for m in MatrixService._extract_normalized_moves(opp):
                if m.get(MOVE_KEY_TYPE):
                    all_types_in_env.add(m[MOVE_KEY_TYPE])

        all_types_list = [t for t in all_types_in_env if t]
        tasks = [fetch_type_data(supabase, t) for t in all_types_list]
        fetched_data_list = await asyncio.gather(*tasks)

        return dict(zip(all_types_list, fetched_data_list))

    @staticmethod
    def _calculate_real_stats(base_stats: dict, evs_internal: dict, nature_name: str) -> dict:
        real_stats = {}
        for api_key, internal_key in STAT_KEY_MAP.items():
            is_hp = (api_key == "H")
            base = base_stats.get(internal_key, 100)
            ev = int(evs_internal.get(internal_key, 0))

            real_stats[internal_key] = calculate_real_status(
                is_hp=is_hp,
                base_stat=base,
                iv=31,
                ev=ev,
                level=BATTLE_LEVEL,
                nature_name=nature_name,
                stat_key=internal_key
            )
        return real_stats

    @staticmethod
    def _simulate_subject_vs_environment(
        subject_name: str,
        subject_real_stats: dict,
        subject_types: list,
        subject_moves_parsed: List[dict],
        subject_ability: str, # ← 引数に追加
        active_environment_pokemons: list,
        type_data_map: Dict[str, Any],
        verbose: bool = False,
    ) -> List[MatrixResultRow]:
        """
        1体（主軸 or 候補）を環境トップ全員と対面させ、
        技選択・ターン数計算・◎◯△×判定を行う。
        """
        results: List[MatrixResultRow] = []

        for opp in active_environment_pokemons:
            opp_nature_name = getattr(opp, 'top_nature', 'まじめ')
            opp_evs_dict = getattr(opp, 'top_evs', {}) or {}

            # 相手側のパラメータも共通関数で作成
            opp_real_stats, opp_types, opp_moves_parsed, opp_ability = MatrixService._prepare_battle_params(
                pokemon_data=opp,
                evs_internal=opp_evs_dict,
                nature_name=opp_nature_name
            )

            sim_result = MatrixService._simulate_1vs1(
                subject_name=subject_name,
                subject_real_stats=subject_real_stats,
                subject_types=subject_types,
                subject_moves_parsed=subject_moves_parsed,
                subject_ability=subject_ability,
                opp_name=opp.name,
                opp_real_stats=opp_real_stats,
                opp_types=opp_types,
                opp_moves_parsed=opp_moves_parsed,
                opp_ability=opp_ability,
                type_data_map=type_data_map,
                verbose=verbose,
            )
            
            print(opp.name,sim_result["judgment"])

            results.append(MatrixResultRow(
                opponent_rank=opp.rank,
                opponent_name=opp.name,
                judgment=sim_result["judgment"],
                reason_category=sim_result["category"]
            ))

        return results

    @staticmethod
    def _simulate_1vs1(
        subject_name: str,
        subject_real_stats: dict,
        subject_types: list,
        subject_moves_parsed: List[dict],
        subject_ability: str,
        opp_name: str,
        opp_real_stats: dict,
        opp_types: list,
        opp_moves_parsed: List[dict],
        opp_ability: str,
        type_data_map: Dict[str, Any],
        verbose: bool = False,
    ) -> dict:
        """
        純粋な1vs1の対面シミュレーションを実行します。
        """
        # ① 自分から相手への最適技を探す
        best_my_turns = 10
        best_my_move = {
            MOVE_KEY_NAME: "攻撃技",
            MOVE_KEY_TYPE: subject_types[0] if subject_types else "ノーマル",
            "power": 90,
            MOVE_KEY_DAMAGE_CLASS: DAMAGE_CLASS_PHYSICAL,
        }
        my_multiplier = 1.0
        my_used_fallback = not MatrixService._has_valid_attack_move(subject_moves_parsed)

        if subject_moves_parsed:
            for move in subject_moves_parsed:
                if move.get(MOVE_KEY_DAMAGE_CLASS) == DAMAGE_CLASS_STATUS or not move.get("power"):
                    continue

                my_move_type = move.get(MOVE_KEY_TYPE)
                type_data = type_data_map.get(my_move_type)
                if type_data:
                    multiplier, _ = calculate_multiplier_and_message(type_data, opp_types)
                else:
                    multiplier = 1.0
                    
                # --- 新規追加: 特性によるダメージ無効化判定 ---
                if opp_ability in IMMUNITY_ABILITIES and my_move_type in IMMUNITY_ABILITIES[opp_ability]:
                    multiplier = 0.0
                
                turns = MatrixService._calc_dynamic_turns_to_kill(
                    atk_stats=subject_real_stats, def_stats=opp_real_stats,
                    move=move, atk_types=subject_types, multiplier=multiplier
                )
                if turns < best_my_turns:
                    best_my_turns = turns
                    best_my_move = move
                    my_multiplier = multiplier

        # ② 相手から自分への最適技を探す
        best_opp_turns = 10
        best_opp_move = {
            MOVE_KEY_NAME: "攻撃技",
            MOVE_KEY_TYPE: opp_types[0] if opp_types else "ノーマル",
            "power": 80,
            MOVE_KEY_DAMAGE_CLASS: DAMAGE_CLASS_PHYSICAL,
        }
        opp_multiplier = 1.0
        opp_used_fallback = not MatrixService._has_valid_attack_move(opp_moves_parsed)

        if opp_moves_parsed:
            for move in opp_moves_parsed:
                if move.get(MOVE_KEY_DAMAGE_CLASS) == DAMAGE_CLASS_STATUS or not move.get("power"):
                    continue

                opp_move_type = move.get(MOVE_KEY_TYPE)
                type_data = type_data_map.get(opp_move_type)

                if type_data:
                    multiplier, _ = calculate_multiplier_and_message(type_data, subject_types)
                else:
                    multiplier = 1.0
                    
                # --- 新規追加: 特性によるダメージ無効化判定 ---
                if subject_ability in IMMUNITY_ABILITIES and opp_move_type in IMMUNITY_ABILITIES[subject_ability]:
                    print(subject_ability,"_じめん無効_",opp_move_type)
                    multiplier = 0.0

                turns = MatrixService._calc_dynamic_turns_to_kill(
                    atk_stats=opp_real_stats, def_stats=subject_real_stats,
                    move=move, atk_types=opp_types, multiplier=multiplier
                )
                if turns < best_opp_turns:
                    best_opp_turns = turns
                    best_opp_move = move
                    opp_multiplier = multiplier

        my_turns = best_my_turns
        opp_turns = best_opp_turns

        if my_used_fallback:
            logger.warning(
                "%s は有効な攻撃技データが無いため、フォールバック技（%s 威力%s）で計算しています。",
                subject_name, best_my_move.get(MOVE_KEY_NAME), best_my_move.get("power"),
            )
        if opp_used_fallback:
            logger.warning(
                "%s は有効な攻撃技データが無いため、フォールバック技（%s 威力%s）で計算しています。",
                opp_name, best_opp_move.get(MOVE_KEY_NAME), best_opp_move.get("power"),
            )

        # ③ マッチアップ判定
        if subject_real_stats["speed"] >= opp_real_stats["speed"]:
            action_order = ActionOrder.FIRST
        else:
            action_order = ActionOrder.SECOND

        has_status_threat = opp_name in STATUS_THREAT_POKEMON_NAMES

        judgment, category = MatrixService._run_flowchart(
            action_order, my_turns, opp_turns, has_status_threat
        )

        if verbose:
            logger.debug("DEBUG: best_my_move = %s", best_my_move)
            logger.debug("DEBUG: best_opp_move = %s", best_opp_move)
            logger.debug("==================================================")
            logger.debug("【対面シミュレーション】攻撃側: %s vs 相手: %s", subject_name, opp_name)
            logger.debug("  ■ S関係: 自分S=%s | 相手S=%s ➔ 行動順: %s",
                          subject_real_stats['speed'], opp_real_stats['speed'], action_order.name)
            logger.debug("  ■ 自分 ➔ 相手:")
            logger.debug("    - 使用技: %s (%s / 威力:%s)",
                          best_my_move.get(MOVE_KEY_NAME), best_my_move.get(MOVE_KEY_TYPE), best_my_move.get('power'))
            logger.debug("    - 相性倍率: %s倍", my_multiplier)
            logger.debug("    - 撃破ターン数: %sターン", my_turns)
            logger.debug("  ■ 相手 ➔ 自分:")
            logger.debug("    - 使用技: %s (%s / 威力:%s)",
                          best_opp_move.get(MOVE_KEY_NAME), best_opp_move.get(MOVE_KEY_TYPE), best_opp_move.get('power'))
            logger.debug("    - 相性倍率: %s倍", opp_multiplier)
            logger.debug("    - 被撃破ターン数: %sターン", opp_turns)
            logger.debug("  ➔ 判定結果: %s (カテゴリ: %s)",
                          judgment.name, category.name if category else 'None')
            logger.debug("==================================================")

        # 画面復元用の詳細データをすべて返す
        print(best_my_move.get(MOVE_KEY_NAME, ""),my_turns,best_opp_move.get(MOVE_KEY_NAME, ""),opp_turns)
        return {
            "action_order": action_order,
            "my_detail": {
                "ability": subject_ability,
                "speed_real": subject_real_stats["speed"],
                "best_move_name": best_my_move.get(MOVE_KEY_NAME, ""),
                "best_move_type": best_my_move.get(MOVE_KEY_TYPE, ""),
                "best_move_power": best_my_move.get("power", 0),
                "type_multiplier": my_multiplier,
                "turns_to_kill": my_turns,
            },
            "opp_detail": {
                "ability": opp_ability,
                "speed_real": opp_real_stats["speed"],
                "best_move_name": best_opp_move.get(MOVE_KEY_NAME, ""),
                "best_move_type": best_opp_move.get(MOVE_KEY_TYPE, ""),
                "best_move_power": best_opp_move.get("power", 0),
                "type_multiplier": opp_multiplier,
                "turns_to_kill": opp_turns,
            },
            "judgment": judgment,
            "category": category,
            "my_used_fallback_move": my_used_fallback,
            "opp_used_fallback_move": opp_used_fallback,
        }

    @staticmethod
    def _calc_dynamic_turns_to_kill(atk_stats: dict, def_stats: dict, move: dict, atk_types: list, multiplier: float) -> int:
        # power は None または 0 のことがあるため not で判定（0 は falsy）
        if not move.get("power") or move.get(MOVE_KEY_DAMAGE_CLASS) == DAMAGE_CLASS_STATUS:
            return 3

        move_damage_class = move.get(MOVE_KEY_DAMAGE_CLASS)
        atk_val = atk_stats["attack"] if move_damage_class == DAMAGE_CLASS_PHYSICAL else atk_stats["sp_attack"]
        def_val = def_stats["defense"] if move_damage_class == DAMAGE_CLASS_PHYSICAL else def_stats["sp_defense"]

        if not atk_val or not def_val:
            return 3

        try:
            base_damage = math.trunc((BATTLE_LEVEL * 2 / 5 + 2) * int(move["power"]) * atk_val / def_val)
            damage = math.trunc(base_damage / 50 + 2)

            if move.get(MOVE_KEY_TYPE) in atk_types:
                damage = math.trunc(damage * STAB_MULTIPLIER)

            damage = math.trunc(damage * multiplier)
            damage = math.trunc(damage * MIN_DAMAGE_ROLL)

            if damage <= 0:
                return 3

            target_hp = def_stats["hp"]
            if damage >= target_hp:
                return 1
            elif damage * 2 >= target_hp:
                return 2
            else:
                return 3
        except Exception as e:
            logger.warning("ダメージ計算中に予期せぬエラーが発生しました: %s", e, exc_info=True)
            return 3

    @staticmethod
    def _run_flowchart(action_order: ActionOrder, my_turns: int, opp_turns: int, has_threat: bool) -> Tuple[AdvantageJudgment, Optional[DisadvantageCategory]]:
        base_judgment = AdvantageJudgment.FAIR

        if action_order == ActionOrder.FIRST:
            if my_turns == 1:
                base_judgment = AdvantageJudgment.EXCELLENT
            elif my_turns == 2 and opp_turns >= 2:
                base_judgment = AdvantageJudgment.GOOD
            elif my_turns == 2 and opp_turns == 1:
                base_judgment = AdvantageJudgment.FAIR
            elif my_turns >= 3:
                base_judgment = AdvantageJudgment.FAIR
        else:
            if my_turns == 1 and opp_turns >= 2:
                base_judgment = AdvantageJudgment.GOOD
            elif my_turns == 2 and opp_turns >= 3:
                base_judgment = AdvantageJudgment.GOOD
            elif my_turns == 2 and opp_turns == 2:
                base_judgment = AdvantageJudgment.FAIR
            elif opp_turns == 1:
                base_judgment = AdvantageJudgment.BAD

        if has_threat and not (action_order == ActionOrder.FIRST and my_turns == 1):
            base_judgment = AdvantageJudgment.BAD

        category = None
        if base_judgment in [AdvantageJudgment.FAIR, AdvantageJudgment.BAD]:
            if has_threat:
                category = DisadvantageCategory.D
            elif my_turns >= 3:
                category = DisadvantageCategory.C
            elif action_order == ActionOrder.SECOND:
                category = DisadvantageCategory.A
            elif action_order == ActionOrder.FIRST and opp_turns == 1:
                category = DisadvantageCategory.B

        return base_judgment, category

    # 1vs1専用の新規メソッドを追加
    @staticmethod
    async def generate_1vs1_matrix(request: OneVsOneRequest, supabase: SupabaseClient) -> OneVsOneResponse:
        from services.pokemon_detail import fetch_pokemon_data

        my_name = request.my_pokemon_name
        opp_name = request.opp_pokemon_name

        # season_moves（技データ）は get_active_season_pokemon_details でしか取得できないため、
        # まずランク上限なしのシーズン全件データから両ポケモンを名前で検索する。
        # fetch_pokemon_data はここでは持たないフィールド（season_moves）があるため、
        # 先にシーズンデータを見て、そこに無いポケモンのみ fetch_pokemon_data にフォールバックする。
        all_season_pokemons = await get_active_season_pokemon_details(supabase)
        season_pokemon_map: Dict[str, Any] = {p.name: p for p in all_season_pokemons}

        my_base_data = season_pokemon_map.get(my_name)
        opp_base_data = season_pokemon_map.get(opp_name)

        fallback_targets = []
        if my_base_data is None:
            fallback_targets.append(("my", my_name))
        if opp_base_data is None:
            fallback_targets.append(("opp", opp_name))

        if fallback_targets:
            fetch_tasks = [fetch_pokemon_data(supabase, name) for _, name in fallback_targets]
            fetched_results = await asyncio.gather(*fetch_tasks, return_exceptions=True)

            for (slot, name), result in zip(fallback_targets, fetched_results):
                label = "自ポケモン" if slot == "my" else "相手ポケモン"
                if isinstance(result, Exception):
                    raise ValueError(f"{label}({name})のデータが存在しません。") from result

                # fetch_pokemon_data 経由のデータには season_moves が含まれないため、
                # ここに来たポケモンは技データ無し（フォールバック技扱い）になる点を明示しておく。
                logger.warning(
                    "%s(%s)は現行シーズンのランキングデータに見つからなかったため、"
                    "fetch_pokemon_data から基礎データのみ取得しました。技データ(season_moves)が"
                    "無いためフォールバック技で計算される可能性があります。",
                    label, name,
                )
                if slot == "my":
                    my_base_data = result
                else:
                    opp_base_data = result

        # 自ポケモンのパラメータ準備（リクエストのカスタム値を適用）
        my_evs_internal = MatrixService._convert_evs_to_internal(request.my_evs)
        my_real_stats, my_types, my_moves_parsed, my_ability = MatrixService._prepare_battle_params(
            pokemon_data=my_base_data,
            evs_internal=my_evs_internal,
            nature_name=request.my_nature,
            requested_ability=getattr(request, 'my_ability', None) # ← 追加
        )

        # 相手ポケモンのパラメータ準備（ランキングトップの値を自動適用）
        opp_nature = MatrixService._get_field(opp_base_data, 'top_nature', 'まじめ')
        opp_evs = MatrixService._get_field(opp_base_data, 'top_evs', {}) or {}
        opp_real_stats, opp_types, opp_moves_parsed, opp_ability = MatrixService._prepare_battle_params( # ← 受け取り変数を追加
            pokemon_data=opp_base_data,
            evs_internal=opp_evs,
            nature_name=opp_nature,
            requested_ability=getattr(request, 'opp_ability', None) # ← 追加
        )

        # この2体の技構成に必要な相性データだけを取得（環境ポケモンは空リストで渡す）
        type_data_map = await MatrixService._build_type_data_map(
            supabase,
            [my_moves_parsed, opp_moves_parsed],
            []
        )

        # シミュレーション実行
        sim_result = MatrixService._simulate_1vs1(
            subject_name=my_name,
            subject_real_stats=my_real_stats,
            subject_types=my_types,
            subject_moves_parsed=my_moves_parsed,
            subject_ability=my_ability,
            opp_name=opp_name,
            opp_real_stats=opp_real_stats,
            opp_types=opp_types,
            opp_moves_parsed=opp_moves_parsed,
            opp_ability=opp_ability,
            type_data_map=type_data_map,
            verbose=True
        )

        return OneVsOneResponse(
            my_pokemon_name=my_name,
            opp_pokemon_name=opp_name,
            action_order=sim_result["action_order"].name,
            my_detail=sim_result["my_detail"],
            opp_detail=sim_result["opp_detail"],
            judgment=sim_result["judgment"].name,
            reason_category=sim_result["category"].name if sim_result["category"] else None
        )