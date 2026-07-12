// frontend/features/candidate-screening/components/Phase2ScreeningTrigger.tsx
"use client";

import React from 'react';
import { MatrixResultRow } from '@/features/TopTierMatchups/types/index';
import { PokemonCandidate } from '../types';
import { useCandidateScreening } from '../hooks/useCandidateScreening';

interface Phase2ScreeningTriggerProps {
  matrixData: MatrixResultRow[];
  onScreeningComplete: (candidates: PokemonCandidate[]) => void;
  isExecuted: boolean;
}

export default function Phase2ScreeningTrigger({
  matrixData,
  onScreeningComplete,
  isExecuted,
}: Phase2ScreeningTriggerProps) {
  const { loading, statusText, runScreening } = useCandidateScreening(onScreeningComplete);

  return (
    <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl text-center">
      <h4 className="text-sm font-bold text-slate-700 mb-2 flex justify-center items-center gap-2">
        フェーズ2：タイプ相性チェッカーによる「候補の機械的スクリーニング」
      </h4>
      <p className="text-xs text-slate-500 max-w-xl mx-auto mb-4 leading-relaxed">
        最新の環境TOP50データを自動探索し、主軸とタイプ相性を突き合わせ。
        <strong>「弱点の一致除外」「耐性の補完」「ターゲットへの攻撃補完」</strong>の3条件を100%データのみで自動フィルタリングします。
      </p>

      <button
        onClick={() => runScreening(matrixData)}
        disabled={isExecuted || loading}
        className={`w-full md:w-auto px-6 py-3 rounded-lg font-bold text-sm transition flex justify-center items-center gap-2 mx-auto shadow-sm ${
          isExecuted
            ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
        }`}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>{statusText}</span>
          </>
        ) : isExecuted ? (
          'スクリーニング完了（候補確定）'
        ) : (
          '条件フィルタリングを自動実行する'
        )}
      </button>
    </div>
  );
}
