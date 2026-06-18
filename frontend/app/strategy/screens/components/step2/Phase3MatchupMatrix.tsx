import React from 'react';
import { Matchups } from './types';

interface Phase3MatchupMatrixProps {
  matchups: Matchups;
}

export default function Phase3MatchupMatrix({ matchups }: Phase3MatchupMatrixProps) {
  return (
    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
      <p className="text-[11px] font-bold text-slate-500 mb-2">【フェーズ3】対ターゲット逆引きマトリクス</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {Object.entries(matchups).map(([target, result]) => (
          <div key={target} className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-slate-200 text-xs">
            <span className="text-slate-600 truncate">{target}</span>
            <span className={`font-black px-2 py-0.5 rounded text-[11px] ${
              result === '◎' ? 'text-emerald-700 bg-emerald-50' : 
              result === '◯' ? 'text-blue-700 bg-blue-50' : 'text-rose-700 bg-rose-50'
            }`}>
              {result}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}