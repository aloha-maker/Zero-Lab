// frontend/features/parties/hooks/usePartyDetail.ts
'use client';

import { useEffect, useState } from 'react';
import type { PartyResponse } from '../types';
import { getPartyDetail } from '../api/getPartyDetail';

// 編集ページで使用するhook。IDを元にパーティ詳細を取得する
export const usePartyDetail = (id: string | undefined) => {
    const [party, setParty] = useState<PartyResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        setIsLoading(true);
        setErrorMsg(null); // ★ 前回の取得で出たエラーを引き継がないようにリセット
        getPartyDetail(id)
            .then((data) => setParty(data))
            .catch((error) => {
                console.error(error);
                setErrorMsg(error instanceof Error ? error.message : 'パーティ情報の取得に失敗しました');
            })
            .finally(() => setIsLoading(false));
    }, [id]);

    return { party, isLoading, errorMsg };
};