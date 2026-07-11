import { useState, useEffect } from "react";
import { MatrixResultRow } from "../types";
import { getMatchupMatrix } from "../api/getMatchupMatrix";

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
      // APIリクエストのパラメーターを構築
      const requestBody = {
        main_pokemon_name: mainPokemonName,
        nature: selectedNatureName.split(" ")[0],
        evs: evs,
      };

      // 切り出したAPI関数を呼び出し
      const data = await getMatchupMatrix(requestBody);
      
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