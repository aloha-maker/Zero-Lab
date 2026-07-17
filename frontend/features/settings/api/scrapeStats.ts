// frontend/features/settings/api/scrapeStats.ts
import { apiClient } from "@/lib/api-client";
import type { ScrapeStatsResult } from "../types";

export async function scrapePokemonStats(
  apiKey: string,
  pokemonId: number,
  url: string
): Promise<ScrapeStatsResult> {
  return apiClient.post<ScrapeStatsResult>(
    "/sync/pokemon/scrape-stats",
    {
      pokemon_id: pokemonId,
      url: url,
    },
    {
      headers: {
        "X-API-Key": apiKey,
      },
    }
  );
}