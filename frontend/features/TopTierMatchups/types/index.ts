import type { PokemonInfo } from "@/features/pokedex/types/index";

export type StatType = 'H' | 'A' | 'B' | 'C' | 'D' | 'S';

/** 主軸ポケモンとして確定し、親や他のセクションに渡すデータ構造 */
export interface ConfiguredMainPokemon {
    name: string;
    pokemonInfo: PokemonInfo;
    nature: { name: string; up: string | null; down: string | null };
    evs: Record<StatType, number>;
    realStats: Record<StatType, number | null>
    tags: string[];
}

export interface ArchetypeAnalysisResult {
    bestArchetype: string;
    scores: { 対面構築: number; サイクル構築: number; 展開構築: number };
    matchedReasons: { 対面構築: string[]; サイクル構築: string[]; 展開構築: string[] };
    topWeaknesses: string[];
}

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


export const statLabels: Record<StatType, string> = { H: "HP", A: "攻撃", B: "防御", C: "特攻", D: "特防", S: "素早さ" };
export const keyMapping: Record<string, StatType> = {
  "hp": "H",
  "attack": "A",
  "defense": "B",
  "special-attack": "C",
  "special-defense": "D",
  "speed": "S"
};