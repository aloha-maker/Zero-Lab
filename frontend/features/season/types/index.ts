import type { PokemonInfo } from "@/features/pokedex/types";

/** GET /seasons/ のレスポンス型 */
export interface RuleResponse {
    id: number;
    name: string;
}

export interface SeasonResponse {
    id: number;
    name: string;
    rule_id: number;
    start_date?: string;
    end_date?: string;
    rule?: RuleResponse;
}

export interface RealDamageRankingResult{
    rank: number;
    pokemon_name: string;
    move_name: string;
    move_type: string;
    category: string;
    power_times_atk: number;
    defense_index: number;
    real_damage_percent: number;
};

export interface SeasonPokemonInfo extends PokemonInfo {
    rank: number;
}

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


