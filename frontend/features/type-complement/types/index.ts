// src/features/type-complement/types/index.ts

export interface ComplementaryPokemon {
    id: number;
    name: string;
    types: string[];
    rank: number;
  }
  
  export interface ComplementaryResponse {
    base_pokemon_id: number;
    base_weaknesses: number[];
    complements: ComplementaryPokemon[];
  }