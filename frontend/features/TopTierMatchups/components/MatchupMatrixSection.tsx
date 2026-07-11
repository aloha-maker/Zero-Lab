"use client";

import { MatchupInput, MatrixResultRow } from "../types"; 
import { useMatchupMatrix } from "../hooks/useMatchupMatrix";

interface MatchupMatrixSectionProps {
  mainPokemonName?: string;
  selectedNatureName?: string;
  evs?: {};
  baseMatchups?: MatchupInput[];
  onMatrixCalculated?: (data: MatrixResultRow[]) => void;
  initialMatrixData?: MatrixResultRow[];
}

export default function MatchupMatrixSection({
  mainPokemonName = "",
  selectedNatureName = "",
  evs,
  onMatrixCalculated,
  initialMatrixData = [],
}: MatchupMatrixSectionProps) {
  
  const { matrixData, isLoading, handleCalculate } = useMatchupMatrix({
    mainPokemonName,
    selectedNatureName,
    evs,
    initialMatrixData,
    onMatrixCalculated
  });

  const getJudgmentBadgeStyle = (judgment: MatrixResultRow["judgment"]) => {
    switch (judgment) {
      case "◎": return "bg-blue-100 text-blue-700";
      case "◯": return "bg-green-100 text-green-700";
      case "△": return "bg-yellow-100 text-yellow-700";
      case "×": return "bg-red-100 text-red-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-bold text-lg text-slate-700">環境トップとの有利不利マトリクス</h3>
          <p className="text-xs text-slate-400 mt-0.5">検証主軸: {mainPokemonName}</p>
        </div>
        <button 
          onClick={handleCalculate}
          disabled={isLoading}
          className="bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:bg-slate-100 disabled:text-slate-400 text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          {isLoading ? "計算中..." : "ダメージ計算を自動実行"}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="p-3 rounded-tl-lg w-1/3">環境ポケモン</th>
              <th className="p-3 text-center w-1/4">対面判定</th>
              <th className="p-3 rounded-tr-lg">不利理由カテゴリー</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {matrixData.length > 0 ? (
              matrixData.map((row, index) => (
                <tr key={`${row.opponent_rank}-${row.opponent_name}-${index}`} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-3 font-medium text-slate-700">
                    {row.opponent_rank}位：{row.opponent_name}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`${getJudgmentBadgeStyle(row.judgment)} font-bold px-3 py-1 rounded text-xs inline-block min-w-[2rem]`}>
                      {row.judgment}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600">
                    {row.reason_category || <span className="text-slate-300">-</span>}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="p-10 text-center text-slate-400 italic bg-slate-50/30 rounded-b-lg">
                  「ダメージ計算を自動実行」ボタンを押して、シミュレーション結果を同期してください
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}