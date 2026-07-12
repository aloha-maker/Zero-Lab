// frontend/features/candidate-screening/components/Phase4RoleChecker.tsx
"use client";

import React from 'react';
import { Archetype, RoleCheckItem } from '../types';

interface Phase4RoleCheckerProps {
  archetype: Archetype;
  // 候補ポケモンの保有技やアイテムデータなどを親から受け取る想定
  checkedItems: RoleCheckItem[];
  onToggleCheck: (id: string) => void;
}

export default function Phase4RoleChecker({ archetype, checkedItems = [], onToggleCheck }: Phase4RoleCheckerProps) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
            Phase 4
          </span>
          アーキタイプ必須パーツ確認: <span className="text-indigo-600">{archetype}構築</span>
        </h4>
      </div>

      <div className="space-y-3">
        {checkedItems.map((item) => (
          <label 
            key={item.id} 
            className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-indigo-50/30 transition-colors cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={item.isChecked}
              onChange={() => onToggleCheck(item.id)}
              className="mt-1 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <span className={`text-xs leading-relaxed ${item.isChecked ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'}`}>
              {item.label}
            </span>
          </label>
        ))}
      </div>

      {/* すべてチェック済みなら完了を表示 */}
      {checkedItems.length > 0 && checkedItems.every(i => i.isChecked) && (
        <div className="mt-4 p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg flex items-center gap-2 animate-bounce">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          構築の必須条件を全て満たしました！
        </div>
      )}
    </div>
  );
}
