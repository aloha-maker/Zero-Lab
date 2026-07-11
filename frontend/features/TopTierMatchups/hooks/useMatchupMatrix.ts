import { useState, useEffect } from "react";
import { MatrixResultRow, MatrixResponse } from "../types"; 
import { API_URL } from '@/lib/api-client';

interface UseMatchupMatrixProps {
  mainPokemonName: string;
  selectedNatureName: string;
  evs?: {};
  initialMatrixData: MatrixResultRow[];
  onMatrixCalculated?: (data: MatrixResultRow[]) => void;
}

export function useMatchupMatrix({
  mainPokemonName,
  selectedNatureName,
  evs,
  initialMatrixData,
  onMatrixCalculated
}: UseMatchupMatrixProps) {
  const [matrixData, setMatrixData] = useState<MatrixResultRow[]>(initialMatrixData);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (initialMatrixData && initialMatrixData.length > 0) {
      setMatrixData(initialMatrixData);
    }
  }, [initialMatrixData]);

  const handleCalculate = async () => {
    setIsLoading(true);
    try {
      const requestBody = {
        main_pokemon_name: mainPokemonName,
        nature: selectedNatureName.split(" ")[0],
        evs: evs,
      };

      const response = await fetch(`${API_URL}/api/v1/strategy/matrix`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error("マトリクスの計算に失敗しました");

      const data: MatrixResponse = await response.json();
      setMatrixData(data.matrix);
      if (onMatrixCalculated) onMatrixCalculated(data.matrix);
      
    } catch (error: any) {
      console.error(error);
      if (error.message) {
        alert(`エラー詳細: ${error.message}`);
      } else {
        alert("エラーが発生しました。バックエンドの起動状態を確認してください。");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { matrixData, isLoading, handleCalculate };
}