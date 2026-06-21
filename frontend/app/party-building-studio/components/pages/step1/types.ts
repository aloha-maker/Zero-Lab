import type { SeasonPokemonInfo, RealDamageRankingResult } from "@/app/types/api";

export type SeasonPokemonResponse = {
    pokemons: SeasonPokemonInfo[];
    real_damage_ranking: RealDamageRankingResult[];
};

export const STAT_COLUMNS = [
    { key: "hp", label: "HP" },
    { key: "attack", label: "攻撃" },
    { key: "defense", label: "防御" },
    { key: "sp_attack", label: "特攻" },
    { key: "sp_defense", label: "特防" },
    { key: "speed", label: "素早" },
] as const;

export type SortKey = "rank" | "id" | "name" | "hp" | "attack" | "defense" | "sp_attack" | "sp_defense" | "speed";
export type SortOrder = "asc" | "desc";