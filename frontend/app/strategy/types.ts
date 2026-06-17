import type { PokemonInfo } from "@/app/types/api";

export type StatType = 'H' | 'A' | 'B' | 'C' | 'D' | 'S';

/** 主軸ポケモンとして確定し、親や他のセクションに渡すデータ構造 */
export interface ConfiguredMainPokemon {
  name: string;
  pokemonInfo: PokemonInfo;
  nature: { name: string; up: string | null; down: string | null };
  evs: Record<StatType, number>;
  realStats: Record<StatType, number>;
  tags: string[];
}

export type TabId =
  | "step1"
  | "step2"
  | "step5"
  | "step6";