import React from 'react';
import { PHASES,CHECKLIST_ITEMS } from "../constants";

// 1. Propsの型定義（ここが正しく定義されているか確認）
interface LeftSidebarProps {
  currentPage: number;
  onPageChange: (page: number) => void;
}

// 2. Componentの定義部分を以下のように修正
export const LeftSidebar: React.FC<LeftSidebarProps> = ({ 
  currentPage, 
  onPageChange
}) => {
  return (
    <aside className="w-full lg:w-72 bg-slate-900/50 p-4 lg:border-l border-slate-800 overflow-y-auto space-y-6">
      <h2 className="text-xs font-extrabold tracking-wide text-slate-400 uppercase flex items-center gap-1.5 mb-3">
              構築フェーズ
      </h2>
      <div className="space-y-1.5">
        {PHASES.map((p) => {
          const isActive = currentPage === Number(p.id);
          return (
            <button
              key={p.id}
              onClick={() => {
                onPageChange(p.id);
              }}
              className={`w-full flex items-center justify-between text-left p-2.5 rounded-lg border transition ${
                isActive 
                  ? 'bg-indigo-600/20 border-indigo-500/70 text-indigo-300 shadow-lg shadow-indigo-600/5' 
                  : 'bg-slate-850 border-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-300'
              }`}
            >
              <div className="truncate pr-2">
                <span className="text-xs font-bold block">{p.name}</span>
              </div>
            </button>
          );
        })}
      </div>

    </aside>
  );
};