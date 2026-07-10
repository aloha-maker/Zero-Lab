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
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchParties = useCallback(async (isMounted = true) => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await getParties();
            if (isMounted) {
                setParties(data);
            }
        } catch (err: unknown) {
            console.error("🔥 パーティデータの取得に失敗しました:", err);
            if (isMounted) {
                if (err instanceof ApiError) {
                    setError(err.message);
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
        let isMounted = true;
        
        fetchParties(isMounted);

        return () => {
            isMounted = false;
        };
    }, [fetchParties]);

    const handleDelete = async (id: string) => {
        if (!confirm("このパーティを削除しますか？")) return;
        
        try {
            await deletePartyApi(id);
            await fetchParties();
        } catch (err) {
            console.error("削除に失敗しました", err);
            alert("削除に失敗しました");
        }
    };

    return { parties, isLoading, error, handleDelete };
};