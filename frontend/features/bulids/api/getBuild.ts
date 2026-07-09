// frontend/features/bulids/api/getBuild.ts
import { apiClient } from "@/lib/api-client";
import type { PokemonBuildResponse } from "../types";

export async function getBuild(id: string): Promise<PokemonBuildResponse> {
  return apiClient.get<PokemonBuildResponse>(`/builds/${id}`);
}
