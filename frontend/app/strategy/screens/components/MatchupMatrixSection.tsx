"use client";

import { useState } from "react";
import { 
  MatchupInput, 
  MatrixResultRow, 
  MatrixCalculationRequest, 
  MatrixResponse 
} from "@/app/types/api"; 

interface MatchupMatrixSectionProps {
  mainPokemonName?: string;
  // 親コンポーネント等から渡される、検証用のベースデータ（初期値としてガブリアス想定のダミーを用意）
  baseMatchups?: MatchupInput[];
}

export default function MatchupMatrixSection({
  mainPokemonName = "ガブリアス",
  baseMatchups = [
    { opponent_rank: 1, opponent_name: "カイリュー", action_order: "先攻", my_turns_to_kill: 2, opp_turns_to_kill: 1 },
    { opponent_rank: 2, opponent_name: "ハバタクカミ", action_order: "後攻", my_turns_to_kill: 2, opp_turns_to_kill: 1 },
    { opponent_rank: 3, opponent_name: "サーフゴー", action_order: "先攻", my_turns_to_kill: 1, opp_turns_to_kill: 3 }
  ]
}: MatchupMatrixSectionProps) {
  // APIから取得した結果（MatrixResultRowの配列）を管理するステート
  const [matrixData, setMatrixData] = useState<MatrixResultRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // バックエンドのAPIを呼び出す関数
  const handleCalculate = async () => {
    setIsLoading(true);
    try {
      // 環境変数などからベースURLを取得（設定されていない場合のフォールバック付き）
      const apiPrefix = process.env.NEXT_PUBLIC_API_PREFIX || "http://127.0.0.1:8000/api/v1";
      
      // 型定義に則ったリクエストボディの作成
      const requestBody: MatrixCalculationRequest = {
        main_pokemon_name: mainPokemonName,
        matchups: baseMatchups,
      };

      const response = await fetch(`${apiPrefix}/strategy/matrix`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("マトリクスの計算に失敗しました");
      }

      // レスポンスを型安全にパース
      const data: MatrixResponse = await response.json();
      setMatrixData(data.matrix);
    } catch (error) {
      console.error(error);
      alert("エラーが発生しました。バックエンドの起動状態を確認してください。");
    } finally {
      setIsLoading(false);
    }
  };

  // 判定（◎/◯/△/×）に応じたバッジのTailwindスタイルを返す関数
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
          <h3 className="font-bold text-lg text-slate-700">
            環境トップとの有利不利マトリクス
          </h3>
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
              // APIよりデータ取得済みの場合はループ展開
              matrixData.map((row) => (
                <tr key={row.opponent_rank} className="hover:bg-slate-50/50 transition-colors">
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
              // 初期状態（未リクエスト時）のプレースホルダー表示
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