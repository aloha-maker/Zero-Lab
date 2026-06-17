export interface MoveDetail {
    name: string;          // 技の日本語名
    type: string;          // タイプの日本語名
    power: number | null;
    damage_class: string;  // カテゴリ
    accuracy: number | null; // 命中率 (null の可能性あり)
}

export interface PokemonInfo {
    id: number;
    name: string;
    english_name: string;
    types: string[];
    abilities: string[];
    base_stats: Record<string, number>;
    weight_kg: number;
    height_m: number;
    moves: MoveDetail[];
    image_url?: string;
}

export interface SeasonPokemonInfo extends PokemonInfo {
    rank: number;
}

/** GET /pokemon/?rule_id= のレスポンス型（サジェスト候補用） */
export interface PokemonListItem {
    pokemon_id: number;
    name: string;
    english_name: string;
    image_url?: string;
}

export interface StatusRequest {
    is_hp: boolean;
    base_stat: number;
    iv: number;
    ev: number;
    level: number;
    nature_modifier: number;
}

export interface StatusResponse {
    real_stat: number;
}

export interface DamageRequest {
    level: number;
    power: number;
    attack: number;
    defense: number;
    is_stab: boolean;
    effectiveness: number;
}

export interface DamageResponse {
    min_damage: number;
    max_damage: number;
}

export interface TypeMatchupRequest {
    attacker_type: string;
    defender_types: string[];
}

export interface TypeMatchupResponse {
    multiplier: number;
    message: string;
}

// Pydanticモデル（schemas/builds.py）と同期する型
export interface BuildCreateRequest {
    pokemon_id: number;
    pokemon_name: string;
    nickname?: string;
    nature: string;
    ability: string;
    item: string;
    tera_type: string;
    moves: string[];
    evs: { H: number, A: number, B: number, C: number, D: number, S: number };
    ivs: { H: number, A: number, B: number, C: number, D: number, S: number };
    memo?: string;
}

export interface BuildUpdateRequest extends BuildCreateRequest { }

export interface PokemonBuildResponse extends BuildCreateRequest {
    id: string;
    created_at?: string;
}

export interface ApiValidationError {
    loc: (string | number)[];
    msg: string;
    type: string;
}

export interface ApiErrorResponse {
    detail: string | ApiValidationError[];
}

// schemas/party.py と同期する型
export interface PartyMember {
    build_id: string;
    slot_index: number;
}

export interface PartyCreateRequest {
    name: string;
    description?: string;
    members: PartyMember[];
}

export interface PartyResponse extends PartyCreateRequest {
    id: string;
    created_at?: string;
}

/** GET /seasons/ のレスポンス型 */
export interface RuleResponse {
    id: number;
    name: string;
}

export interface SeasonResponse {
    id: number;
    name: string;
    rule_id: number;
    start_date?: string;
    end_date?: string;
    rule?: RuleResponse;
}

export interface RealDamageRankingResult{
    rank: number;
    pokemon_name: string;
    move_name: string;
    move_type: string;
    category: string;
    power_times_atk: number;
    defense_index: number;
    real_damage_percent: number;
};

// ============================================================================
// strategy (有利不利マトリクス) 関連の型
// ============================================================================

/** 行動順の定義型 */
export type ActionOrder = "先攻" | "後攻";

/** 有利不利の判定結果型 */
export type AdvantageJudgment = "◎" | "◯" | "△" | "×";

/** 不利（△/×）な場合の理由カテゴリー型 */
export type DisadvantageCategory = 
  | "A：速度負け" 
  | "B：行動保障潰し" 
  | "C：数値受け" 
  | "D：機能停止";

/** POST /strategy/matrix のリクエスト内の1対面分のデータ型 */
export interface MatchupInput {
  opponent_rank: number;       // 相手の環境順位
  opponent_name: string;       // 相手のポケモン名
  action_order: ActionOrder;   // 主軸側の行動順
  my_turns_to_kill: number;    // 主軸側が相手を倒すのに必要な確定数(1=確1, 2=確2, 3=確3以上)
  opp_turns_to_kill: number;   // 相手側が主軸を倒すのに必要な確定数(1=確1, 2=確2, 3=確3以上)
  has_status_move_threat?: boolean; // 相手の変化技（あくび等）の脅威があるか
  has_countermeasure?: boolean;     // 主軸側にラム・身代わり等の対策があるか
  is_completely_stopped?: boolean;  // 回復・起点化により完全に機能停止させられるか
}

/** POST /strategy/matrix のリクエスト型 */
export interface MatrixCalculationRequest {
  main_pokemon_name: string;   // 検証する主軸のポケモン名
  matchups: MatchupInput[];    // 各環境ポケモンとの対面データリスト
}

/** POST /strategy/matrix のレスポンス内の1行分のデータ型 */
export interface MatrixResultRow {
  opponent_rank: number;
  opponent_name: string;
  judgment: AdvantageJudgment;
  reason_category: DisadvantageCategory | null; // 有利な場合は null
}

/** POST /strategy/matrix のレスポンス型 */
export interface MatrixResponse {
  main_pokemon_name: string;   // 対象の主軸ポケモン名
  matrix: MatrixResultRow[];   // 計算済みのマトリクス結果リスト
}