import React from 'react';

interface Phase4RoleCheckerProps {
  checks: string[];
}

export default function Phase4RoleChecker({ checks }: Phase4RoleCheckerProps) {
  return (
    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col justify-between">
      <div>
        <p className="text-[11px] font-bold text-slate-500 mb-2">【フェーズ4】戦術アーキタイプ必須パーツ判定</p>
        <div className="space-y-1.5">
          {checks.map((check, idx) => (
            <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-700">
              <svg className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span>{check}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}