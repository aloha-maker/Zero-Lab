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
    id: string;
    created_at?: string;
}