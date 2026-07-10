// frontend/features/bulids/components/SaveButton.tsx
import React from 'react';

interface SaveButtonProps {
  saving: boolean;
  errorMsg?: string | null;
  submitLabel?: string;
}

export const SaveButton: React.FC<SaveButtonProps> = ({ saving, errorMsg, submitLabel }) => {
  return (
    <div className="px-6 md:px-8 py-5 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
      {errorMsg ? (
        <p className="text-red-500 text-sm font-bold">{errorMsg}</p>
      ) : (
        <div />
      )}
      <button
        type="submit"
        disabled={saving}
        className="w-full sm:w-auto px-8 py-2.5 text-sm bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-bold rounded-xl hover:brightness-110 disabled:opacity-50 transition-all shadow-md flex items-center justify-center min-w-[180px]"
      >
        {saving ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {submitLabel ? `${submitLabel.replace('する', '')}中...` : "登録中..."}
          </>
        ) : (
          submitLabel || "ポケモンを登録する"
        )}
      </button>
    </div>
  );
};