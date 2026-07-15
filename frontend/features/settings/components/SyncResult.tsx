// frontend/features/settings/components/SyncResult.tsx
"use client";

import { CheckCircle2 } from "lucide-react";
import type { SyncResult as SyncResultType } from "../types";

type Props = {
  result: SyncResultType | null;
};

export function SyncResult({ result }: Props) {
  if (!result) return null;

  return (
    <div className="rounded-md bg-green-50 p-4 border border-green-200 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-start">
        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />

        <div className="ml-3">
          <h3 className="text-sm font-medium text-green-800">
            {result.message}
          </h3>

          <div className="mt-3 text-sm text-green-700">
            <ul className="list-disc pl-5 space-y-1">
              <li>ポケモン種族: <b>{result.summary.species_count}</b> 件</li>
              <li>各フォルム・姿: <b>{result.summary.pokemon_count}</b> 件</li>
              <li>タイプマスター: <b>{result.summary.types_count}</b> 件</li>
              <li>特性マスター: <b>{result.summary.abilities_count}</b> 件</li>
              <li>覚える技: <b>{result.summary.moves_relations_count}</b> 件</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}