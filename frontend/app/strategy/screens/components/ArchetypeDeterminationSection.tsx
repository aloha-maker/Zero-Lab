"use client";

import { useMemo } from "react";
import { MatrixResultRow } from "@/app/types/api";

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

  // アーキタイプ判定と弱点分析を自動計算
  const analysisResult = useMemo(() => {
    if (!matrixData || matrixData.length === 0) return null;

    // 1. マトリクスの判定カウント
    const counts = { "◎": 0, "◯": 0, "△": 0, "×": 0 };
    matrixData.forEach((row) => {
      counts[row.judgment]++;
    });
    const total = matrixData.length;
    const xRatio = counts["×"] / total;
    const polarRatio = (counts["◎"] + counts["×"]) / total;

    // 2. 弱点（不利理由）の集計
    const weaknessCounts: Record<string, number> = {};
    matrixData.forEach((row) => {
      if ((row.judgment === "△" || row.judgment === "×") && row.reason_category) {
        weaknessCounts[row.reason_category] = (weaknessCounts[row.reason_category] || 0) + 1;
      }
    });
    
    // 出現頻度が高い弱点トップ2を抽出
    const topWeaknesses = Object.entries(weaknessCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([category]) => category);

    // 3. アーキタイプのスコアリング
    const scores = {
      対面構築: 0,
      サイクル構築: 0,
      展開構築: 0,
    };
    const matchedReasons = {
      対面構築: [] as string[],
      サイクル構築: [] as string[],
      展開構築: [] as string[],
    };

    // --- 対面構築ルートの判定 ---
    if (tags.includes("行動保障") || tags.includes("縛り性能")) {
      scores.対面構築 += 1;
      matchedReasons.対面構築.push("「行動保障」または「縛り性能」のタグがある");
    }
    if (xRatio <= 0.2) { // ×が極端に少ない（全体の20%以下と定義）
      scores.対面構築 += 1;
      matchedReasons.対面構築.push(`「×」が極端に少なく(${counts["×"]}体)、広く対面で殴り合える`);
    }

    // --- サイクル構築ルートの判定 ---
    if (tags.includes("対面操作") || tags.includes("耐久・回復")) {
      scores.サイクル構築 += 1;
      matchedReasons.サイクル構築.push("「対面操作」または「耐久・回復」のタグがある");
    }
    if (polarRatio >= 0.5) { // ◎と×がハッキリ分かれている（全体の50%以上を占めると定義）
      scores.サイクル構築 += 1;
      matchedReasons.サイクル構築.push("「◎」と「×」が明確に分かれており、引くべき場面が分かりやすい");
    }

    // --- 展開構築ルートの判定 ---
    if (tags.includes("崩し性能")) {
      scores.展開構築 += 1;
      matchedReasons.展開構築.push("「崩し性能」のタグがある");
    }
    if (counts["△"] > 0 || counts["×"] > 0) { // 突破すべき不利対面が存在する
      scores.展開構築 += 1;
      matchedReasons.展開構築.push("条件を整えることで不利対面(△/×)を強引に突破するポテンシャルがある");
    }

    // 最もスコアが高いアーキタイプを決定（同点の場合は対面 > サイクル > 展開の順を優先）
    let bestArchetype = "対面構築";
    let maxScore = scores.対面構築;

    if (scores.サイクル構築 > maxScore) {
      bestArchetype = "サイクル構築";
      maxScore = scores.サイクル構築;
    }
    if (scores.展開構築 > maxScore) {
      bestArchetype = "展開構築";
      maxScore = scores.展開構築;
    }

    return {
      bestArchetype,
      scores,
      matchedReasons,
      topWeaknesses,
    };
  }, [tags, matrixData]);

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

  // 弱点テキストの組み立て
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
                <div className="absolute -top-3 -right-3 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
                  推奨
                </div>
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