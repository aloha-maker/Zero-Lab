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
    { name: "さみしがり (攻撃↑ 防御↓)", up: "attack", down: "defense" },
    { name: "いじっぱり (攻撃↑ 特攻↓)", up: "attack", down: "sp_attack" },
    { name: "やんちゃ (攻撃↑ 特防↓)", up: "attack", down: "sp_defense" },
    { name: "ゆうかん (攻撃↑ 素早↓)", up: "attack", down: "speed" },
    { name: "ずぶとい (防御↑ 攻撃↓)", up: "defense", down: "attack" },
    { name: "わんぱく (防御↑ 特攻↓)", up: "defense", down: "sp_attack" },
    { name: "のうてんき (防御↑ 特防↓)", up: "defense", down: "sp_defense" },
    { name: "のんき (防御↑ 素早↓)", up: "defense", down: "speed" },
    { name: "ひかえめ (特攻↑ 攻撃↓)", up: "sp_attack", down: "attack" },
    { name: "おっとり (特攻↑ 防御↓)", up: "sp_attack", down: "defense" },
    { name: "うっかりや (特攻↑ 特防↓)", up: "sp_attack", down: "sp_defense" },
    { name: "れいせい (特攻↑ 素早↓)", up: "sp_attack", down: "speed" },
    { name: "おだやか (特防↑ 攻撃↓)", up: "sp_defense", down: "attack" },
    { name: "おとなしい (特防↑ 防御↓)", up: "sp_defense", down: "defense" },
    { name: "しんちょう (特防↑ 特攻↓)", up: "sp_defense", down: "sp_attack" },
    { name: "なまいき (特防↑ 素早↓)", up: "sp_defense", down: "speed" },
    { name: "おくびょう (素早↑ 攻撃↓)", up: "speed", down: "attack" },
    { name: "せっかち (素早↑ 防御↓)", up: "speed", down: "defense" },
    { name: "ようき (素早↑ 特攻↓)", up: "speed", down: "sp_attack" },
    { name: "むじゃき (素早↑ 特防↓)", up: "speed", down: "sp_defense" },
    { name: "てれや (補正なし)", up: null, down: null },
    { name: "がんばりや (補正なし)", up: null, down: null },
    { name: "すなお (補正なし)", up: null, down: null },
    { name: "きまぐれ (補正なし)", up: null, down: null },
    { name: "まじめ (補正なし)", up: null, down: null },
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
    nature_modifier: number;
}

export interface StatusResponse {
    real_stat: number;
}