"use client";

import { AlertCircle } from "lucide-react";

type Props = {
  error: string | null;
};

export function SyncError({ error }: Props) {
  if (!error) return null;

  return (
    <div className="rounded-md bg-red-50 p-4 border border-red-200">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />

        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            同期エラー
          </h3>

          <div className="mt-1 text-sm text-red-700">
            {error}
          </div>
        </div>
      </div>
    </div>
  );
}