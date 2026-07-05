"use client";

import { Loader2 } from "lucide-react";

type Props = {
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
};

export function SyncButton({
  loading,
  disabled,
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={`w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
        ${
          loading || disabled
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        } transition-colors duration-200`}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          データを同期しています...
        </>
      ) : (
        "今すぐデータを同期する"
      )}
    </button>
  );
}