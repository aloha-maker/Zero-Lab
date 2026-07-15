// frontend/features/settings/hooks/useScrapeMoves.ts
"use client";

import { useState } from "react";
import { scrapePokemonMoves } from "../api/scrapeMoves";
import type { ScrapeResult } from "../types";

export function useScrapeMoves(apiKey: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScrapeResult | null>(null);
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
      const data = await scrapePokemonMoves(apiKey, Number(pokemonId), url);
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