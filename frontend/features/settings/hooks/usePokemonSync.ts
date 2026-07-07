// frontend/features/settings/hooks/usePokemonSync.ts
"use client";

import { useEffect, useState } from "react";
import { syncPokemon } from "../api/syncPokemon";
import { getApiKey, saveApiKey } from "../utils/storage";
import type { SyncResult } from "../types";

export function usePokemonSync() {
  const [apiKey, setApiKeyState] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 初期ロード時にAPIキーを復元
  useEffect(() => {
    setApiKeyState(getApiKey());
  }, []);

  // APIキー更新
  const setApiKey = (key: string) => {
    setApiKeyState(key);
    saveApiKey(key);
  };

  // データ同期
  const handleSync = async () => {
    if (!apiKey) {
      setError("APIキーを入力してください。");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await syncPokemon(apiKey);
      setResult(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "バックエンドとの通信に失敗しました。サーバーが起動しているか確認してください。"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    apiKey,
    setApiKey,
    isLoading,
    result,
    error,
    handleSync,
  };
}