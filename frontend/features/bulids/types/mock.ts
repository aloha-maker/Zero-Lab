export type Stats = {
  HP: number;
  attack: number;
  defense: number;
  sp_attack: number;
  sp_defense: number;
  speed: number;
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