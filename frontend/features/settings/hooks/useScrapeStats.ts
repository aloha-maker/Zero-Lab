// frontend/features/settings/hooks/useScrapeStats.ts
"use client";

import { useState } from "react";
import { scrapePokemonStats } from "../api/scrapeStats";
import type { ScrapeStatsResult } from "../types";

export function useScrapeStats(apiKey: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScrapeStatsResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pokemonId, setPokemonId] = useState<number | "">("");
  const [url, setUrl] = useState("");

  const handleScrape = async () => {
    if (!apiKey) {
      setError("APIキーを入力してください。");
      return;
    }
    if (!pokemonId || !url) {
      setError("ポケモンIDとURLの両方を入力してください。");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await scrapePokemonStats(apiKey, Number(pokemonId), url);
      setResult(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("スクレイピング通信に失敗しました。");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    pokemonId,
    setPokemonId,
    url,
    setUrl,
    isLoading,
    result,
    error,
    handleScrape,
  };
}