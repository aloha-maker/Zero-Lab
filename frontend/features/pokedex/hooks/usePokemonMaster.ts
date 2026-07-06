// src/features/pokedex/hooks/usePokemonMaster.ts
import { useState, useEffect } from "react";
import type { CandidatePokemon } from "../types";
import { apiClient, ApiError } from "@/lib/api-client";

interface UsePokemonMasterResult {
    candidates: CandidatePokemon[];
    isMasterLoading: boolean;
    error: string | null;
}

export const usePokemonMaster = (): UsePokemonMasterResult => {
    const [candidates, setCandidates] = useState<CandidatePokemon[]>([]);
    const [isMasterLoading, setIsMasterLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // コンポーネントのアンマウント時に状態更新を防ぐためのフラグ
        let isMounted = true;

        const fetchPokemonMaster = async () => {
            setIsMasterLoading(true);
            setError(null);

            try {
                // apiClient が URLの結合やJSONパースを全てやってくれる
                const data = await apiClient.get<CandidatePokemon[]>("/api/v1/pokemon/list");
                
                if (isMounted) {
                    setCandidates(data);
                }
            } catch (err: unknown) {
                console.error("🔥 ポケモンマスターデータの取得に失敗しました:", err);
                
                if (isMounted) {
                    if (err instanceof ApiError) {
                        // apiClient で構築済みのエラーメッセージをそのまま渡す
                        setError(err.message);
                    } else {
                        setError("予期せぬエラーが発生しました");
                    }
                }
            } finally {
                if (isMounted) {
                    setIsMasterLoading(false);
                }
            }
        };

        fetchPokemonMaster();

        // クリーンアップ関数
        return () => {
            isMounted = false;
        };
    }, []);

    return { candidates, isMasterLoading, error };
};