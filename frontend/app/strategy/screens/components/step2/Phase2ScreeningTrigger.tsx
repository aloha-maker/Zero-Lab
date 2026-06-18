import React from 'react';

interface Phase2ScreeningTriggerProps {
  onExecute: () => void;
  isExecuted: boolean;
}

export default function Phase2ScreeningTrigger({ onExecute, isExecuted }: Phase2ScreeningTriggerProps) {
  return (
    <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl text-center">
      <h4 className="text-sm font-bold text-slate-700 mb-2 flex justify-center items-center gap-2">
        フェーズ2：候補の機械的スクリーニング
      </h4>
      <p className="text-xs text-slate-500 max-w-md mx-auto mb-4 leading-relaxed">
        環境上位ポケモンから「弱点の一致除外」「耐性の補完」「攻撃の補完（ターゲットの弱点を突ける一致技）」の3条件で自動フィルタリングします。
      </p>
      <button 
        onClick={onExecute}
        disabled={isExecuted}
        className={`w-full md:w-auto px-6 py-3 rounded-lg font-bold text-sm transition flex justify-center items-center gap-2 mx-auto shadow-sm ${
          isExecuted 
            ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
        {isExecuted ? 'スクリーニング完了' : '条件フィルタリングを実行する'}
      </button>
    </div>
  );
}