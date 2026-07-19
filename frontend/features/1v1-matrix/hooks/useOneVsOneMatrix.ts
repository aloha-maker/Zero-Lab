import { useState } from "react";
import { fetch1v1Matrix } from "../api/simulate1v1";
import { OneVsOneRequest, OneVsOneResponse } from "../types";

export function useOneVsOneMatrix() {
  const [requestData, setRequestData] = useState<OneVsOneRequest>({
    my_pokemon_name: "",
    my_evs: { H: 0, A: 0, B: 0, C: 0, D: 0, S: 0 },
    my_nature: "まじめ",
    opp_pokemon_name: "",
  });

  const [result, setResult] = useState<OneVsOneResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleEvChange = (statKey: string, value: number) => {
    setRequestData((prev) => ({
      ...prev,
      my_evs: { ...prev.my_evs, [statKey]: value },
    }));
  };

  const handleInputChange = (field: keyof OneVsOneRequest, value: string) => {
    setRequestData((prev) => ({ ...prev, [field]: value }));
  };

  const executeSimulation = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await fetch1v1Matrix(requestData);
      setResult(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "シミュレーションに失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  return {
    requestData,
    result,
    loading,
    error,
    handleEvChange,
    handleInputChange,
    executeSimulation,
  };
}