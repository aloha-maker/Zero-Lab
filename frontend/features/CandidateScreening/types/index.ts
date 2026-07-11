// frontend/features/CandidateScreening/types
export type Matchups = { [targetName: string]: '◎' | '◯' | '×' };

export interface PokemonCandidate {
  name: string; // 単体の場合は名前、ペアの場合は「ハッサム ＆ ヒードラン」など
  isPair?: boolean; // ペア採用かどうかのフラグ
  matchups: { [targetName: string]: '◎' | '◯' | '×' };
  archetypeTags: string[];
  passChecks: string[];
  rate: number;
  badgeColor: string;
}