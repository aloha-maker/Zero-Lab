// frontend/features/parties/hooks/useParties.ts
import { useState, useEffect, useCallback } from 'react';
import type { PartyResponse } from '../types';
import { ApiError } from '@/lib/api-client';
import { getParties } from '../api/getParties';
import { deleteParty as deletePartyApi } from '../api/deleteParty';

interface UsePartiesResult {
    parties: PartyResponse[];
    isLoading: boolean;
    error: string | null;
    handleDelete: (id: string) => Promise<void>;
}

export const useParties = (): UsePartiesResult => {
    const [parties, setParties] = useState<PartyResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true); // ローディング状態を追加[cite: 2]
    const [error, setError] = useState<string | null>(null); // エラー状態を追加[cite: 2]

    const fetchParties = useCallback(async (isMounted = true) => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await getParties(); // 切り出したAPI関数を実行[cite: 2]
            if (isMounted) {
                setParties(data);
            }
        } catch (err: unknown) {
            console.error("🔥 パーティデータの取得に失敗しました:", err);
            if (isMounted) {
                if (err instanceof ApiError) {
                    setError(err.message); // ApiErrorのメッセージをセット[cite: 2]
                } else {
                    setError("予期せぬエラーが発生しました");
                }
            }
        } finally {
            if (isMounted) {
                setIsLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        let isMounted = true; // アンマウント時の状態更新を防ぐフラグ[cite: 2]
        
        fetchParties(isMounted);

        return () => {
            isMounted = false; // クリーンアップ関数[cite: 2]
        };
    }, [fetchParties]);

    const handleDelete = async (id: string) => {
        if (!confirm("このパーティを削除しますか？")) return;
        
        try {
            await deletePartyApi(id);
            // 削除後、一覧を再取得して画面を更新
            await fetchParties();
        } catch (err) {
            console.error("削除に失敗しました", err);
            alert("削除に失敗しました");
        }
    };

    return { parties, isLoading, error, handleDelete };
};