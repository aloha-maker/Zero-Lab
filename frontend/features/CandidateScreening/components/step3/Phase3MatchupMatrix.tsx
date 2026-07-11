// app/strategy/screens/components/step2/Phase3MatchupMatrix.tsx
"use client";

import React from 'react';
import { Matchups } from './types'; // types.ts で定義した型をインポート

interface Phase3MatchupMatrixProps {
  matchups: Matchups; // { 'ハバタクカミ': '◎', 'カイリュー': '◯' } のようなデータ
}

export default function Phase3MatchupMatrix({ matchups }: Phase3MatchupMatrixProps) {
  // 判定に応じたスタイルを返すヘルパー
  const getBadgeStyle = (judgment: '◎' | '◯' | '×') => {
    switch (judgment) {
      case '◎': return "text-emerald-700 bg-emerald-50 border-emerald-200 font-black";
      case '◯': return "text-blue-700 bg-blue-50 border-blue-200 font-bold";
      case '×': return "text-rose-700 bg-rose-50 border-rose-200 font-bold";
      default: return "text-slate-600 bg-slate-50 border-slate-200";
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          【フェーズ3】対ターゲット相性シミュレーション
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {Object.entries(matchups).map(([target, judgment]) => (
          <div 
            key={target} 
            className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-100 bg-slate-50/50"
          >
            <span className="text-xs font-medium text-slate-600 truncate max-w-[100px]" title={target}>
              vs {target}
            </span>
            <span className={`px-2 py-0.5 rounded text-[11px] border ${getBadgeStyle(judgment)}`}>
              {judgment}
            </span>
          </div>
        ))}
      </div>

      {/* 補足ルール表示 */}
      <div className="mt-3 text-[10px] text-slate-400 flex items-start gap-1">
        <span className="mt-0.5">ℹ️</span>
        <p>1匹で全てのターゲットに◯以上を出せるか、ペアの組み合わせで全網羅しているかを確認します。</p>
      </div>
    </div>
  );
}