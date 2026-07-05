import type { PokemonInfo } from "@/features/pokedex/types";

export const STAT_KEYS = ["hp", "attack", "defense", "special-attack", "special-defense", "speed"] as const;
export type PokemonStatKey = typeof STAT_KEYS[number];

export interface StatusCalcProps {
    initialPokemon?: PokemonInfo | null;
    initialPokemonName?: string;
    onStatusUpdate?: (data: {
        pokemon_id?: number;
        pokemon_name?: string;
        nature?: string;
        evs: { H: number; A: number; B: number; C: number; D: number; S: number };
    }) => void;
}

export const LEVEL = 50;
export const INDIVIDUAL_VALUE = 31;
export const NATURES = [
    { name: "さみしがり (攻撃↑ 防御↓)", up: "A", down: "B" },
    { name: "いじっぱり (攻撃↑ 特攻↓)", up: "A", down: "C" },
    { name: "やんちゃ (攻撃↑ 特防↓)", up: "A", down: "D" },
    { name: "ゆうかん (攻撃↑ 素早↓)", up: "A", down: "S" },
    { name: "ずぶとい (防御↑ 攻撃↓)", up: "B", down: "A" },
    { name: "わんぱく (防御↑ 特攻↓)", up: "B", down: "C" },
    { name: "のうてんき (防御↑ 特防↓)", up: "B", down: "D" },
    { name: "のんき (防御↑ 素早↓)", up: "B", down: "S" },
    { name: "ひかえめ (特攻↑ 攻撃↓)", up: "C", down: "A" },
    { name: "おっとり (特攻↑ 防御↓)", up: "C", down: "B" },
    { name: "うっかりや (特攻↑ 特防↓)", up: "C", down: "D" },
    { name: "れいせい (特攻↑ 素早↓)", up: "C", down: "S" },
    { name: "おだやか (特防↑ 攻撃↓)", up: "D", down: "A" },
    { name: "おとなしい (特防↑ 防御↓)", up: "D", down: "B" },
    { name: "しんちょう (特防↑ 特攻↓)", up: "D", down: "C" },
    { name: "なまいき (特防↑ 素早↓)", up: "D", down: "S" },
    { name: "おくびょう (素早↑ 攻撃↓)", up: "S", down: "A" },
    { name: "せっかち (素早↑ 防御↓)", up: "S", down: "B" },
    { name: "ようき (素早↑ 特攻↓)", up: "S", down: "C" },
    { name: "むじゃき (素早↑ 特防↓)", up: "S", down: "D" },
    { name: "てれや (補正なし)", up: null, down: null },
    { name: "がんばりや (補正なし)", up: null, down: null },
    { name: "すなお (補正なし)", up: null, down: null },
    { name: "きまぐれ (補正なし)", up: null, down: null },
    { name: "まじめ (補正なし)", up: null, down: null },
];

export type StatRecord = Record<PokemonStatKey, { base: number; ev: number }>;
export type ResultRecord = Record<PokemonStatKey, number | null>;


export interface StatusRequest {
    is_hp: boolean;
    base_stat: number;
    iv: number;
    ev: number;
    level: number;
    nature_modifier: number;
}

export interface StatusResponse {
    real_stat: number;
}