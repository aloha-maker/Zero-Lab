import { apiClient } from "@/lib/api-client";
import type { BuildUpdateRequest, PokemonBuildResponse } from "../types";

export async function updateBuild(id: string, data: BuildUpdateRequest): Promise<PokemonBuildResponse> {
  return apiClient.put<PokemonBuildResponse>(`/builds/${id}`, data);
}
