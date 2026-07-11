// screens/components/step2/Phase1TargetList.tsx
import React from 'react';
import { MatrixResultRow } from '@/features/TopTierMatchups/types/index';

interface Phase1TargetListProps {
  matrixData: MatrixResultRow[];
}

export default function Phase1TargetList({ matrixData }: Phase1TargetListProps) {
  // マトリクスデータから「×」と「△」のポケモンを抽出・分類
  const groupA = matrixData.filter((row) => row.judgment === '×');
  const groupB = matrixData.filter((row) => row.judgment === '△');

  // まだ計算が行われていない場合
  if (matrixData.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center text-slate-400 italic text-xs">
        Step1の「環境トップとの有利不利マトリクス」でダメージ計算を実行すると、ここに補完対象ターゲットが自動抽出されます。
      </div>
    );
  }

  return (
    <div className="bg-rose-50/50 border border-rose-100 p-4 rounded-xl space-y-4">
      <div>
        <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          フェーズ1：補完対象（ターゲット）リスト
        </h4>
        <p className="text-[11px] text-rose-600">
          主軸が不利をとる相手です。2匹目・3匹目に「絶対に勝ってもらわなければならない」最優先の対策対象となります。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* ターゲットA群（×判定） */}
        <div className="bg-white p-3 rounded-lg border border-red-100 shadow-sm">
          <h5 className="text-xs font-bold text-red-600 mb-2 flex items-center gap-1">
            <span className="px-1.5 py-0.5 text-[10px] bg-red-100 text-red-700 rounded font-black">A群</span>
            絶対に対策が必要（×判定：{groupA.length}匹）
          </h5>
          {groupA.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {groupA.map((row, i) => (
                <span key={i} className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded font-medium border border-red-100">
                  {row.opponent_name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">該当なし</p>
          )}
        </div>

        {/* ターゲットB群（△判定） */}
        <div className="bg-white p-3 rounded-lg border border-yellow-100 shadow-sm">
          <h5 className="text-xs font-bold text-yellow-600 mb-2 flex items-center gap-1">
            <span className="px-1.5 py-0.5 text-[10px] bg-yellow-100 text-yellow-700 rounded font-black">B群</span>
            不利寄り・要補完（△判定：{groupB.length}匹）
          </h5>
          {groupB.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {groupB.map((row, i) => (
                <span key={i} className="bg-yellow-50 text-yellow-700 text-xs px-2 py-1 rounded font-medium border border-yellow-100">
                  {row.opponent_name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">該当なし</p>
          )}
        </div>
      </div>
    </div>
  );
}