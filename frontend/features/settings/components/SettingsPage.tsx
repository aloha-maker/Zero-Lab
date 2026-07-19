// frontend/features/settings/components/SettingsPage.tsx
"use client";

import { Database } from "lucide-react";
import { ApiKeyInput } from "./ApiKeyInput";
import { SyncButton } from "./SyncButton";
import { SyncError } from "./SyncError";
import { SyncResult } from "./SyncResult";
import { usePokemonSync } from "../hooks/usePokemonSync";
import { ScrapeForm } from "./ScrapeForm";

export function SettingsPage() {
  const sync = usePokemonSync();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-8"> 
        {/* 全体をラップして幅を調整すると綺麗です */}
        
        {/* --- 既存の全体同期セクション --- */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-600"/>
            データ同期設定
          </h2>

          <div className="space-y-6">
            <ApiKeyInput
              value={sync.apiKey}
              onChange={sync.setApiKey}
            />

            <SyncButton
              loading={sync.isLoading}
              disabled={!sync.apiKey}
              onClick={sync.handleSync}
            />

            <SyncError error={sync.error} />
            <SyncResult result={sync.result} />
          </div>
        </div>

        {/* --- 新規追加: 個別スクレイピングセクション --- */}
        <ScrapeForm apiKey={sync.apiKey} />

      </div>
    </div>
  );
}