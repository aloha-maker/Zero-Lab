// frontend/features/settings/components/ApiKeyInput.tsx
"use client";

import { KeyRound } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function ApiKeyInput({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <label
        htmlFor="apiKey"
        className="block text-sm font-medium text-gray-700"
      >
        同期用 API Key
      </label>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <KeyRound className="h-5 w-5 text-gray-400" />
        </div>

        <input
          id="apiKey"
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="your-secret-api-key-here"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      <p className="text-xs text-gray-500">
        ※ セキュリティのため、APIキーはブラウザ内にのみ保存されます。
      </p>
    </div>
  );
}