// frontend/features/settings/api/scrapeMoves.ts
import { apiClient } from "@/lib/api-client";
import type { ScrapeResult } from "../types";

export async function scrapePokemonMoves(
  apiKey: string,
  pokemonId: number,
  url: string
): Promise<ScrapeResult> {
  return apiClient.post<ScrapeResult>(
    "/sync/pokemon/scrape-moves",
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