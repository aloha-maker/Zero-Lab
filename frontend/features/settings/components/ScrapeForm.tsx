// frontend/features/settings/components/ScrapeForm.tsx
"use client";

import { useScrapeMoves } from "../hooks/useScrapeMoves";
import { SyncButton } from "./SyncButton"; // 既存のボタンを再利用
import { SyncError } from "./SyncError";   // 既存のエラー表示を再利用
import { ScrapeResultDisplay } from "./ScrapeResultDisplay";

type Props = {
  apiKey: string;
};

export function ScrapeForm({ apiKey }: Props) {
  const scrape = useScrapeMoves(apiKey);

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <h3 className="text-lg font-medium text-gray-500 mb-4">手動スクレイピング</h3>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            ポケモンID (全国図鑑No)
          </label>
          <input
            type="number"
            value={scrape.pokemonId}
            onChange={(e) => scrape.setPokemonId(e.target.value ? Number(e.target.value) : "")}
            placeholder="例: 260"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            スクレイピング対象URL
          </label>
          <input
            type="url"
            value={scrape.url}
            onChange={(e) => scrape.setUrl(e.target.value)}
            placeholder="例: https://yakkun.com/ch/zukan/n260"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-400"
          />
        </div>
      </div>

      <SyncButton
        loading={scrape.isLoading}
        disabled={!apiKey || !scrape.pokemonId || !scrape.url}
        onClick={scrape.handleScrape}
      />

      <div className="mt-4">
        <SyncError error={scrape.error} />
      </div>

      <div className="mt-4">
        <ScrapeResultDisplay result={scrape.result} />
      </div>
    </div>
  );
}
