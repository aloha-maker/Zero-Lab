import React, { useMemo } from "react";
import { useMutualComplement } from "../hooks/useMutualComplement";
import { MatrixRow } from "../types";

interface CandidateInput {
  id: number;
  name: string;
}

interface Props {
  basePokemonName: string;
  baseMatrix: MatrixRow[];
  filteredCandidates: CandidateInput[]; // ②で絞り込まれた候補
}

export default function MutualComplementSection({
  basePokemonName,
  baseMatrix,
  filteredCandidates,
}: Props) {
  const { calculateScores, resultScores, isLoading, error } = useMutualComplement();

  // 自動実行の useEffect を削除し、ボタンクリック時のハンドラーを追加
  const handleCalculate = () => {
    if (filteredCandidates.length > 0 && baseMatrix.length > 0) {
      calculateScores(baseMatrix, filteredCandidates);
    }
  };

  // テーブル縦軸（トップ50）の作成
  const topOpponents = useMemo(() => {
    return [...baseMatrix]
      .sort((a, b) => a.opponent_rank - b.opponent_rank)
      .map((row) => ({
        rank: row.opponent_rank,
        name: row.opponent_name,
      }));
  }, [baseMatrix]);

  return (
    <section className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
      {/* ヘッダーと実行ボタンのエリア */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-2">
        <div>
          <h2 className="text-xl font-bold text-slate-800">最終候補：相互補完ランキング</h2>
          <p className="text-sm text-slate-600 mt-1">
            絞り込まれた候補（{filteredCandidates.length}体）について、環境トップ50との相性を取得しスコアを計算します。
          </p>
        </div>
        
        <button
          onClick={handleCalculate}
          disabled={isLoading || filteredCandidates.length === 0}
          className="whitespace-nowrap px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              計算中...
            </span>
          ) : (
            "ランキングを計算する"
          )}
        </button>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="mt-4 p-4 text-red-600 bg-red-50 border-l-4 border-red-500 rounded-lg">
          {error}
        </div>
      )}

      {/* 結果テーブル（計算完了後に表示） */}
      {resultScores && resultScores.length > 0 && (
        <div className="overflow-x-auto mt-6">
          <table className="w-full text-sm text-center border-collapse border border-slate-200">
            <thead className="bg-slate-50 sticky top-0 z-20">
              {/* 1行目: キャラ名と総合スコア */}
              <tr>
                <th className="border border-slate-200 p-2 min-w-[140px] sticky left-0 bg-slate-50 z-30 shadow-[1px_0_0_0_#e2e8f0]" rowSpan={2}>
                  環境トップ
                </th>
                <th className="border border-slate-200 p-2 bg-blue-50 font-bold min-w-[100px]" rowSpan={2}>
                  {basePokemonName} <br/><span className="text-xs font-normal text-slate-500">(主軸)</span>
                </th>
                {resultScores.map((score, index) => (
                  <th key={score.candidate_id} className="border border-slate-200 p-2 min-w-[120px]">
                    <div className="font-bold text-slate-800">{index + 1}位: {score.candidate_name}</div>
                    <div className="text-xs font-bold text-blue-600 mt-1">スコア: {score.total_score}</div>
                  </th>
                ))}
              </tr>
              {/* 2行目: 内訳スコア */}
              <tr>
                {resultScores.map(score => (
                  <th key={`summary-${score.candidate_id}`} className="border border-slate-200 p-2 text-xs font-normal bg-white">
                    <div className="text-green-600">主軸カバー: {score.base_cover_count}</div>
                    <div className="text-blue-600">候補カバー: {score.candidate_cover_count}</div>
                    <div className="text-red-500 font-medium">共通弱点: {score.common_weakness_count}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topOpponents.map((opponent) => (
                <tr key={opponent.rank} className="hover:bg-slate-50">
                  <td className="border border-slate-200 p-2 text-left sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#e2e8f0]">
                    <span className="text-slate-400 mr-2 w-5 inline-block text-right">{opponent.rank}</span>
                    {opponent.name}
                  </td>
                  
                  {/* 主軸の判定 */}
                  <td className="border border-slate-200 p-2 bg-blue-50/30">
                    {baseMatrix.find(m => m.opponent_rank === opponent.rank)?.judgment || "-"}
                  </td>

                  {/* 候補の判定 */}
                  {resultScores.map((score) => {
                    const judgment = score.matrix.find(m => m.opponent_rank === opponent.rank)?.judgment || "-";
                    const baseJudgment = baseMatrix.find(m => m.opponent_rank === opponent.rank)?.judgment;
                    
                    // 主軸と候補の両方が△か×なら共通弱点として赤くハイライト
                    const isCommonWeakness = 
                      (judgment === "△" || judgment === "×") && 
                      (baseJudgment === "△" || baseJudgment === "×");

                    return (
                      <td 
                        key={`${score.candidate_id}-${opponent.rank}`} 
                        className={`border border-slate-200 p-2 font-medium ${
                          isCommonWeakness ? 'bg-red-50 text-red-600' : 'text-slate-700'
                        }`}
                      >
                        {judgment}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}