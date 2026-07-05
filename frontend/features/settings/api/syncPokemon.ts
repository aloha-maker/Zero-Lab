import { apiClient } from "@/lib/api-client";
import type { SyncResult } from "../types";

export async function syncPokemon(apiKey: string): Promise<SyncResult> {
  return apiClient.post<SyncResult>(
    "/api/v1/sync/pokemon",
    {},
    {
      headers: {
        "X-API-Key": apiKey,
      },
    }
  );
}
