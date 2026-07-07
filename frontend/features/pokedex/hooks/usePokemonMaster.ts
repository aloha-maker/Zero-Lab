// src/features/pokedex/hooks/usePokemonMaster.ts
import { useState, useEffect } from "react";
import type { CandidatePokemon } from "../types";
import { ApiError } from "@/lib/api-client";
import { getPokemonMaster } from "../api/getPokemonMaster"; // 作成したAPI関数をインポート

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
                // API通信を切り出した関数で実行
                const data = await getPokemonMaster();
                
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