

export interface MoveDetail {
    name: string;          // 技の日本語名
    type: string;          // タイプの日本語名
    power: number | null;
    damage_class: string;  // カテゴリ
    accuracy: number | null; // 命中率 (null の可能性あり)
}



/** GET /pokemon/?rule_id= のレスポンス型（サジェスト候補用） */
export interface PokemonListItem {
    pokemon_id: number;
    name: string;
    english_name: string;
    image_url?: string;
}

export interface DamageRequest {
    level: number;
    power: number;
    attack: number;
    defense: number;
    is_stab: boolean;
    effectiveness: number;
}

export interface DamageResponse {
    min_damage: number;
    max_damage: number;
}

export interface TypeMatchupRequest {
    attacker_type: string;
    defender_types: string[];
}

export interface TypeMatchupResponse {
    multiplier: number;
    message: string;
}


export interface ApiValidationError {
    loc: (string | number)[];
    msg: string;
    type: string;
}

export interface ApiErrorResponse {
    detail: string | ApiValidationError[];
}

// ============================================================================
// strategy (有利不利マトリクス) 関連の型
// ============================================================================




