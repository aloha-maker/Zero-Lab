"use client";

import { Database } from "lucide-react";
import { ApiKeyInput } from "./ApiKeyInput";
import { SyncButton } from "./SyncButton";
import { SyncError } from "./SyncError";
import { SyncResult } from "./SyncResult";
import { usePokemonSync } from "../hooks/usePokemonSync";

export function SettingsPage() {
  const sync = usePokemonSync();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* 既存レイアウト */}

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
  );
}