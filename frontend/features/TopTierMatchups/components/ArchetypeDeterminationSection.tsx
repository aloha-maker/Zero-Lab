"use client";

import { useMemo } from "react";
import { MatrixResultRow } from "../types";
import { analyzeArchetype } from "../utils/analyzeArchetype";

interface ArchetypeDeterminationSectionProps {
  mainPokemonName: string;
  tags: string[];
  matrixData: MatrixResultRow[];
}

export default function ArchetypeDeterminationSection({
  mainPokemonName = "主軸ポケモン",
  tags = [],
  matrixData = [],
}: ArchetypeDeterminationSectionProps) {
  const analysisResult = useMemo(() => analyzeArchetype(tags, matrixData), [tags, matrixData]);

  if (!analysisResult) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-lg text-slate-700 mb-2">戦術アーキタイプの自動判定</h3>
        <p className="text-sm text-slate-400 italic bg-slate-50 p-4 rounded-lg text-center">
          マトリクスの計算が完了すると、最適な構築アーキタイプが自動判定されます。
        </p>
      </div>
    );
  }

  const { bestArchetype, matchedReasons, topWeaknesses } = analysisResult;
  const weaknessText = topWeaknesses.length > 0 
    ? topWeaknesses.join("」と「") 
    : "特定の明確な弱点（データ不足）";

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-top-4 duration-300">
      <h3 className="font-bold text-lg text-slate-700 mb-4 flex items-center gap-2">
        <span className="text-blue-500">◆</span> 結論：最適な戦術アーキタイプ
      </h3>

      <div className="bg-slate-800 text-white p-5 rounded-xl mb-6 shadow-inner">
        <p className="text-sm text-slate-300 mb-1">【言語化された方針】</p>
        <p className="text-lg font-medium leading-relaxed">
          この{mainPokemonName}は<span className="text-red-400 font-bold border-b border-red-400/50 pb-0.5 mx-1">「{weaknessText}」</span>に弱く、それを補いつつ強みを押し付ける<span className="text-blue-400 font-bold border-b border-blue-400/50 pb-0.5 mx-1">【{bestArchetype}】</span>のアーキタイプで運用すべきである。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(["対面構築", "サイクル構築", "展開構築"] as const).map((archetype) => {
          const isSelected = archetype === bestArchetype;
          const reasons = matchedReasons[archetype as keyof typeof matchedReasons];

          return (
            <div 
              key={archetype}
              className={`p-4 rounded-lg border-2 transition-all ${
                isSelected 
                  ? "border-blue-500 bg-blue-50/50 shadow-sm relative" 
                  : "border-slate-100 bg-slate-50 opacity-60"
              }`}
            >
              {isSelected && (
                <div className="absolute -top-3 -right-3 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">推奨</div>
              )}
              <h4 className={`font-bold mb-3 ${isSelected ? "text-blue-700" : "text-slate-600"}`}>
                {archetype}
              </h4>
              <ul className="space-y-2 text-sm text-slate-600">
                {reasons.length > 0 ? (
                  reasons.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className={isSelected ? "text-blue-500" : "text-slate-400"}>✔</span>
                      <span className="leading-tight">{reason}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400 italic text-xs">判定条件に一致しません</li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}