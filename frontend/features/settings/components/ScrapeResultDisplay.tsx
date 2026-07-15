// frontend/features/settings/components/ScrapeResultDisplay.tsx
"use client";

import { CheckCircle2, AlertTriangle } from "lucide-react";
import type { ScrapeResult } from "../types";

type Props = {
  result: ScrapeResult | null;
};

export function ScrapeResultDisplay({ result }: Props) {
  if (!result) return null;

  const hasUnmatched = result.summary.unmatched_names && result.summary.unmatched_names.length > 0;

  return (
    <div className="rounded-md bg-green-50 p-4 border border-green-200 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-start">
        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
        <div className="ml-3 w-full">
          <h3 className="text-sm font-medium text-green-800">
            {result.message}
          </h3>
          
          <div className="mt-3 text-sm text-green-700">
            <ul className="list-disc pl-5 space-y-1">
              <li>対象ポケモンID: <b>{result.summary.pokemon_id}</b></li>
              <li>サイトから取得した技名: <b>{result.summary.scraped_count}</b> 件</li>
              <li>DBに登録(Upsert)した件数: <b>{result.summary.upserted_count}</b> 件</li>
            </ul>
          </div>

          {hasUnmatched && (
            <div className="mt-4 rounded-md bg-yellow-50 p-3 border border-yellow-200">
              <div className="flex items-start">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="ml-2">
                  <h4 className="text-xs font-medium text-yellow-800">
                    以下の技は名前が一致せず登録スキップされました
                  </h4>
                  <p className="mt-1 text-xs text-yellow-700">
                    {result.summary.unmatched_names.join(", ")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
