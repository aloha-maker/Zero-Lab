// frontend/features/settings/components/ScrapeStatsResultDisplay.tsx
"use client";

import { CheckCircle2 } from "lucide-react";
import type { ScrapeStatsResult, ScrapeStatsValues } from "../types";

type Props = {
  result: ScrapeStatsResult | null;
};

const STAT_LABELS: { key: keyof ScrapeStatsValues; label: string }[] = [
  { key: "hp", label: "HP" },
  { key: "attack", label: "こうげき" },
  { key: "defense", label: "ぼうぎょ" },
  { key: "sp_attack", label: "とくこう" },
  { key: "sp_defense", label: "とくぼう" },
  { key: "speed", label: "すばやさ" },
];

export function ScrapeStatsResultDisplay({ result }: Props) {
  if (!result) return null;

  return (
    <div className="rounded-md bg-green-50 p-4 border border-green-200 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-start">
        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
        <div className="ml-3 w-full">
          <h3 className="text-sm font-medium text-green-800">
            {result.message}
          </h3>

          <div className="mt-3 text-sm text-green-700">
            <p className="mb-2">
              対象ポケモンID: <b>{result.summary.pokemon_id}</b>
            </p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1 list-disc pl-5">
              {STAT_LABELS.map(({ key, label }) => (
                <li key={key}>
                  {label}: <b>{result.summary.scraped_stats[key]}</b>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}