// src/features/pokedex/types/index.ts

/**
 * 技の基本情報
 */
export interface MoveDetail {
    name: string;          // 技の日本語名
    type: string;          // タイプの日本語名
    power: number | null;
    damage_class: string;  // カテゴリ
    accuracy: number | null; // 命中率 (null の可能性あり)
}


/**
 * ポケモンの基本情報
 */
export interface PokemonInfo {
    id: number;
    name: string;
    english_name: string;
    types: string[];
    abilities: string[];
    base_stats: Record<string, number>;
    weight_kg: number;
    height_m: number;
    moves: MoveDetail[];
    image_url?: string;
}

/**
 * サジェスト候補用の軽量なポケモン情報（修正）
 */
export interface CandidatePokemon {
    id: number;
    name: string;      // API検索に使う英名（例: pikachu）
    jaName: string;    // 表示に使う日本語名（例: ピカチュウ）
    imageUrl?: string; // 必要に応じて画像URLも保持可能
}