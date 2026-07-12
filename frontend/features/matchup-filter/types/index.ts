// frontend/features/matchup-filter/types/index.ts
import type { ComplementaryPokemon } from "@/features/type-complement/types";
import type { MatrixResultRow } from "@/features/TopTierMatchups/types";


/** POST /api/v1/strategy/step2-filter へのリクエストボディ */
export interface MatchupFilterRequest {
    candidates: ComplementaryPokemon[];
    targets: MatrixResultRow[];
}

/** フィルタ後の候補ポケモン（勝てる相手の内訳付き） */
export interface FilteredCandidate extends ComplementaryPokemon {
    good_matchups: string[];
}

/** POST /api/v1/strategy/step2-filter のレスポンス */
export interface MatchupFilterResponse {
    filtered_candidates: FilteredCandidate[];
}