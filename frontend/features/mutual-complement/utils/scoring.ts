import { PokemonMatrix, ComplementScore } from "../types";
import type { AdvantageJudgment, MatrixResultRow } from "@/features/TopTierMatchups/types";

const JUDGMENT_SCORE: Record<AdvantageJudgment, number> = {
  "◎": 2,
  "◯": 1,
  "△": -1,
  "×": -2,
};

const getScore = (judgment: AdvantageJudgment) => JUDGMENT_SCORE[judgment] ?? 0;

export const calculateComplementScores = (
  baseMatrix: MatrixResultRow[],
  candidateMatrices: PokemonMatrix[]
): ComplementScore[] => {
  const baseJudgmentMap = new Map<number, AdvantageJudgment>();
  baseMatrix.forEach((row) => {
    baseJudgmentMap.set(row.opponent_rank, row.judgment);
  });

  const scores = candidateMatrices.map((candidateMatrix) => {
    let totalScore = 0;
    let baseCoverCount = 0;
    let candidateCoverCount = 0;
    let commonWeaknessCount = 0;

    candidateMatrix.matrix.forEach((candidateRow) => {
      const rank = candidateRow.opponent_rank;
      const weight = 51 - rank; 
      const cJudgment = candidateRow.judgment;
      const bJudgment = baseJudgmentMap.get(rank) || "△";

      const cScore = getScore(cJudgment);
      const bScore = getScore(bJudgment);

      totalScore += weight * Math.max(cScore, bScore);

      const bIsWeak = bJudgment === "△" || bJudgment === "×";
      const bIsStrong = bJudgment === "◎" || bJudgment === "◯";
      const cIsWeak = cJudgment === "△" || cJudgment === "×";
      const cIsStrong = cJudgment === "◎" || cJudgment === "◯";

      if (bIsWeak && cIsStrong) baseCoverCount++;
      if (cIsWeak && bIsStrong) candidateCoverCount++;
      if (bIsWeak && cIsWeak) commonWeaknessCount++;
    });

    return {
      candidate_id: candidateMatrix.id,          // 修正: candidateMatrix.id を参照
      candidate_name: candidateMatrix.name,      // 修正: APIから返ってきた name をそのまま使用
      total_score: totalScore,
      base_cover_count: baseCoverCount,
      candidate_cover_count: candidateCoverCount,
      common_weakness_count: commonWeaknessCount,
      matrix: candidateMatrix.matrix,
    };
  });

  scores.sort((a, b) => {
    if (a.total_score !== b.total_score) {
      return b.total_score - a.total_score;
    }
    return a.common_weakness_count - b.common_weakness_count;
  });

  return scores;
};