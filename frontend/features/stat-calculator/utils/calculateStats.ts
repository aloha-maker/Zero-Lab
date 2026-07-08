// frontend/features/stat-calculator/utils/calculateStats.ts

import type { PokemonInfo } from "@/features/pokedex/types";
import { STAT_KEYS, EV_MAX_PER_STAT, type PokemonStatKey, type StatRecord } from "../types";

const DEFAULT_BASE_STATS: Record<PokemonStatKey, number> = STAT_KEYS.reduce((acc, key) => {
    acc[key] = 0;
    return acc;
}, {} as Record<PokemonStatKey, number>);

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

/**
 * EV入力値を 0 〜 EV_MAX_PER_STAT の範囲にクランプする。
 * UI側の input[max] だけに依存すると直接入力・ペーストで上限を超えられるため、
 * ロジック側でも必ず正規化する。
 */
export const clampEv = (value: number): number => {
    if (Number.isNaN(value)) return 0;
    return Math.min(EV_MAX_PER_STAT, Math.max(0, value));
};