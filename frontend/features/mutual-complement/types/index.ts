export type Judgment = "◎" | "◯" | "△" | "×";

export interface MatrixRow {
  opponent_rank: number;
  opponent_name: string;
  judgment: Judgment;
  reason_category: string | null;
}

// 修正：pokemon_id -> id に変更し、name を追加
export interface PokemonMatrix {
  id: number;
  name: string;
  matrix: MatrixRow[];
}

export interface BulkMatrixRequest {
  candidates: {
    id: number;
    name: string;
  }[];
}

export interface BulkMatrixResponse {
  results: PokemonMatrix[];
}

export interface ComplementScore {
  candidate_id: number;
  candidate_name: string;
  total_score: number;
  base_cover_count: number;
  candidate_cover_count: number;
  common_weakness_count: number;
  matrix: MatrixRow[];
}