// src/features/pokedex/api/searchPokemon.ts
import { apiClient } from "@/lib/api-client";
import type { PokemonInfo } from "../types";

export async function searchPokemon(query: string): Promise<PokemonInfo> {
  // apiClient側で API_PREFIX が付与されるため "/pokemon/..." だけでOKです
  return apiClient.get<PokemonInfo>(`/pokemon/${query}`);
}