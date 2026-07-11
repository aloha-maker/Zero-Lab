import { ArchetypeAnalysisResult,MatrixResultRow } from "../types";

export function analyzeArchetype(tags: string[], matrixData: MatrixResultRow[]): ArchetypeAnalysisResult | null {
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
  
  const topWeaknesses = Object.entries(weaknessCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([category]) => category);

  // 3. アーキタイプのスコアリング
  const scores = { 対面構築: 0, サイクル構築: 0, 展開構築: 0 };
  const matchedReasons = { 対面構築: [] as string[], サイクル構築: [] as string[], 展開構築: [] as string[] };

  // --- 対面構築ルートの判定 ---
  if (tags.includes("行動保障") || tags.includes("縛り性能")) {
    scores.対面構築 += 1;
    matchedReasons.対面構築.push("「行動保障」または「縛り性能」のタグがある");
  }
  if (xRatio <= 0.2) { 
    scores.対面構築 += 1;
    matchedReasons.対面構築.push(`「×」が極端に少なく(${counts["×"]}体)、広く対面で殴り合える`);
  }

  // --- サイクル構築ルートの判定 ---
  if (tags.includes("対面操作") || tags.includes("耐久・回復")) {
    scores.サイクル構築 += 1;
    matchedReasons.サイクル構築.push("「対面操作」または「耐久・回復」のタグがある");
  }
  if (polarRatio >= 0.5) { 
    scores.サイクル構築 += 1;
    matchedReasons.サイクル構築.push("「◎」と「×」が明確に分かれており、引くべき場面が分かりやすい");
  }

  // --- 展開構築ルートの判定 ---
  if (tags.includes("崩し性能")) {
    scores.展開構築 += 1;
    matchedReasons.展開構築.push("「崩し性能」のタグがある");
  }
  if (counts["△"] > 0 || counts["×"] > 0) { 
    scores.展開構築 += 1;
    matchedReasons.展開構築.push("条件を整えることで不利対面(△/×)を強引に突破するポテンシャルがある");
  }

  // 最もスコアが高いアーキタイプを決定
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

  return { bestArchetype, scores, matchedReasons, topWeaknesses };
}