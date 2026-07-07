// src/features/pokedex/api/getPokemonMaster.ts
import { apiClient } from "@/lib/api-client";
import type { CandidatePokemon } from "../types";

export async function getPokemonMaster(): Promise<CandidatePokemon[]> {
  // apiClient側でプレフィックスが付与されるため "/pokemon/list" とします
  return apiClient.get<CandidatePokemon[]>("/pokemon/list");
}