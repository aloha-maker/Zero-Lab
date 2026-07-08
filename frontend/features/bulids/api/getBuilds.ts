import { apiClient } from "@/lib/api-client";
import type { PokemonBuildResponse } from "../types";

export interface GetBuildsResponse {
  status: string;
  data: PokemonBuildResponse[];
}

export async function getBuilds(): Promise<GetBuildsResponse> {
  return apiClient.get<GetBuildsResponse>("/builds");
}
