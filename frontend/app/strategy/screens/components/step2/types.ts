// types.ts
export type Matchups = { [targetName: string]: '◎' | '◯' | '×' };

export interface PokemonCandidate {
  name: string;
  matchups: Matchups;
  archetypeTags: string[];
  passChecks: string[];
  rate: number;
  badgeColor: string;
}