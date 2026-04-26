export interface PokemonInfo {
    id: number;
    name: string;
    english_name: string;
    types: string[];
    abilities: string[];
    base_stats: Record<string, number>;
    weight_kg: number;
    height_m: number;
    moves: string[];
    image_url?: string;
}

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

// Pydanticモデル（schemas/builds.py）と同期する型
export interface BuildCreateRequest {
    pokemon_id: number;
    pokemon_name: string;
    nickname?: string;
    nature: string;
    ability: string;
    item: string;
    tera_type: string;
    moves: string[];
    evs: { H: number, A: number, B: number, C: number, D: number, S: number };
    ivs: { H: number, A: number, B: number, C: number, D: number, S: number };
    memo?: string;
}

export interface BuildUpdateRequest extends BuildCreateRequest { }

export interface PokemonBuildResponse extends BuildCreateRequest {
    id: string; // データベース上で採番されたUUIDなど
    created_at?: string;
}


export interface ApiValidationError {
    loc: (string | number)[];
    msg: string;
    type: string;
}

export interface ApiErrorResponse {
    detail: string | ApiValidationError[];
}