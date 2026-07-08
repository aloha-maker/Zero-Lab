import { apiClient } from "@/lib/api-client";
import type { BuildCreateRequest, PokemonBuildResponse } from "../types";

export async function createBuild(data: BuildCreateRequest): Promise<PokemonBuildResponse> {
  return apiClient.post<PokemonBuildResponse>("/builds/", data);
}
