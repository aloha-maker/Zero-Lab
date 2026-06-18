import React from 'react';

interface Phase1TargetListProps {
  targets: string[];
}

export default function Phase1TargetList({ targets }: Phase1TargetListProps) {
  return (
    <div className="bg-rose-50/50 border border-rose-100 p-4 rounded-xl">
      <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
        フェーズ1：補完対象（ターゲット）リスト
      </h4>
      <div className="flex flex-wrap gap-2">
        {targets.map((name, i) => (
          <span key={i} className="bg-white border border-rose-200 text-rose-700 text-xs font-bold px-3 py-1 rounded-lg shadow-sm">
            {name} {i === 0 ? '（A群:×）' : '（B群:△）'}
          </span>
        ))}
      </div>
      <p className="text-[11px] text-rose-600 mt-2">※2匹目・3匹目に「絶対に勝ってもらわなければならない」最優先の対策対象です。</p>
    </div>
  );
}