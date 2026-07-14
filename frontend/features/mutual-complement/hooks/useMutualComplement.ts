import { useState, useCallback } from "react";
import { fetchBulkMatrix } from "../api/fetchBulkMatrix";
import { calculateComplementScores } from "../utils/scoring";
import { MatrixRow, ComplementScore } from "../types";
import { ApiError } from "@/lib/api-client";

interface CandidateInput {
  id: number;
  name: string;
}

export const useMutualComplement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultScores, setResultScores] = useState<ComplementScore[] | null>(null);

  const calculateScores = useCallback(async (
    baseMatrix: MatrixRow[],
    candidates: CandidateInput[]
  ) => {
    if (!candidates.length) return;

    setIsLoading(true);
    setError(null);

    try {
      // ③ マトリクス一括取得
      const response = await fetchBulkMatrix({ candidates });

      // ④ 相互補完スコアリング
      const scores = calculateComplementScores(baseMatrix, response.results);
      
      setResultScores(scores);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("マトリクスデータの取得中に予期せぬエラーが発生しました");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { calculateScores, resultScores, isLoading, error };
};