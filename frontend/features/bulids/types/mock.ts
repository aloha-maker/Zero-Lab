export type StatType = 'H' | 'A' | 'B' | 'C' | 'D' | 'S';

export type Stats = {
  H: number;
  A: number;
  B: number;
  C: number;
  D: number;
  S: number;
};

export interface TrainedPokemon {
  id: string;
  nickname: string;
  species: string;
  item: string;
  ability: string;
  teraType: string;
  moves: string[];
  baseStats: Stats;
  evs: Stats;
  actualStats: Stats;
  notes: string;
  imageUrl: string;
}