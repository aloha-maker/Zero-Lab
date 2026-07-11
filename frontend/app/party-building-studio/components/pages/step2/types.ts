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

export const statLabels: Record<StatType, string> = { H: "HP", A: "攻撃", B: "防御", C: "特攻", D: "特防", S: "素早さ" };
export const keyMapping: Record<string, StatType> = {
  "hp": "H",
  "attack": "A",
  "defense": "B",
  "special-attack": "C",
  "special-defense": "D",
  "speed": "S"
};