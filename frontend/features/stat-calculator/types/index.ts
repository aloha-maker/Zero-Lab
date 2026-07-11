import type { PokemonInfo } from "@/features/pokedex/types";

export const STAT_KEYS = ["hp", "attack", "defense", "sp_attack", "sp_defense", "speed"] as const;
export type PokemonStatKey = typeof STAT_KEYS[number];

export interface StatusCalcProps {
    initialPokemon?: PokemonInfo | null;
    initialPokemonName?: string;
    onStatusUpdate?: (data: {
        pokemon_id?: number;
        pokemon_name?: string;
        nature?: string;
        evs: Record<PokemonStatKey, number>;
    }) => void;
}

export const LEVEL = 50;
export const INDIVIDUAL_VALUE = 31;

/** 1ステータスあたりのEV入力上限 */
export const EV_MAX_PER_STAT = 32;
/** EV合計の上限（本アプリ固有の仕様値。本家の510ではなく66が正） */
export const EV_TOTAL_MAX = 66;

/**
 * 性格ごとの上昇/下降ステータス。
 * up/down は PokemonStatKey を直接参照するため、natureChar(H/A/B/C/D/S) への
 * 変換テーブルを介さずに比較・補正計算ができる。
 */
export const NATURES: { name: string; up: PokemonStatKey | null; down: PokemonStatKey | null }[] = [
    { name: "さみしがり (A↑ B↓)", up: "attack", down: "defense" },
    { name: "いじっぱり (A↑ C)", up: "attack", down: "sp_attack" },
    { name: "やんちゃ (A↑ D↓)", up: "attack", down: "sp_defense" },
    { name: "ゆうかん (A↑ S↓)", up: "attack", down: "speed" },
    { name: "ずぶとい (B↑ A↓)", up: "defense", down: "attack" },
    { name: "わんぱく (B↑ C↓)", up: "defense", down: "sp_attack" },
    { name: "のうてんき (B↑ D↓)", up: "defense", down: "sp_defense" },
    { name: "のんき (B↑ S↓)", up: "defense", down: "speed" },
    { name: "ひかえめ (C↑ A↓)", up: "sp_attack", down: "attack" },
    { name: "おっとり (C↑ B↓)", up: "sp_attack", down: "defense" },
    { name: "うっかりや (C↑ D↓)", up: "sp_attack", down: "sp_defense" },
    { name: "れいせい (C↑ S↓)", up: "sp_attack", down: "speed" },
    { name: "おだやか (D↑ A↓)", up: "sp_defense", down: "attack" },
    { name: "おとなしい (D↑ B↓)", up: "sp_defense", down: "defense" },
    { name: "しんちょう (D↑ C↓)", up: "sp_defense", down: "sp_attack" },
    { name: "なまいき (D↑ S↓)", up: "sp_defense", down: "speed" },
    { name: "おくびょう (S↑ A↓)", up: "speed", down: "attack" },
    { name: "せっかち (S↑ B↓)", up: "speed", down: "defense" },
    { name: "ようき (S↑ C↓)", up: "speed", down: "sp_attack" },
    { name: "むじゃき (S↑ D↓)", up: "speed", down: "sp_defense" },
    { name: "てれや", up: null, down: null },
    { name: "がんばりや", up: null, down: null },
    { name: "すなお", up: null, down: null },
    { name: "きまぐれ", up: null, down: null },
    { name: "まじめ", up: null, down: null },
];

export type StatRecord = Record<PokemonStatKey, { base: number; ev: number }>;
export type ResultRecord = Record<PokemonStatKey, number | null>;

/** 空の計算結果を生成する。初期値・リセット処理での重複したベタ書きを避けるための共通関数。 */
export const createEmptyResults = (): ResultRecord =>
    STAT_KEYS.reduce((acc, key) => {
        acc[key] = null;
        return acc;
    }, {} as ResultRecord);

export interface StatusRequest {
    is_hp: boolean;
    base_stat: number;
    iv: number;
    ev: number;
    level: number;
    nature_name: string;
    stat_key: string;
}

export interface StatusResponse {
    real_stat: number;
}