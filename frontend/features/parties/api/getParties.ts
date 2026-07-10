import { API_URL } from '@/lib/api-client';
import { ApiError } from '@/lib/api-client';
import type { PartyResponse } from '../types';

export const getParties = async (): Promise<PartyResponse[]> => {
    const res = await fetch(`${API_URL}/api/v1/parties/`);
    
    if (!res.ok) {
        throw new ApiError(`パーティ一覧の取得に失敗しました: ${res.statusText}`,0);
    }

    const json = await res.json();
    console.log("Fetched Data:", json);

    if (json.status === "success" && Array.isArray(json.data)) {
        return json.data;
    }
    
    return [];
};