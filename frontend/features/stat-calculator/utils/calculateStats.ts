import type { PokemonInfo } from "@/features/pokedex/types";
import { STAT_KEYS, type PokemonStatKey, type StatRecord } from "../types";

export const NATURE_MAP: Record<PokemonStatKey, string> = {
    "hp": "H", "attack": "A", "defense": "B", "special-attack": "C", "special-defense": "D", "speed": "S"
};

const DEFAULT_BASE_STATS: Record<PokemonStatKey, number> = {
    "hp": 0, "attack": 0, "defense": 0, "special-attack": 0, "special-defense": 0, "speed": 0
};

export const createInitialStats = (pokemon?: PokemonInfo | null): StatRecord => {
    const statsHashes = {} as StatRecord;
    STAT_KEYS.forEach((key) => {
        statsHashes[key] = {
            base: pokemon?.base_stats[key] ?? DEFAULT_BASE_STATS[key],
            ev: 0,
        };
    });
    return statsHashes;
};