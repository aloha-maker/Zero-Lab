import { API_URL, ApiError } from '@/lib/api-client';
import type { PartyCreateRequest } from '../types';

export const saveParty = async (
    payload: PartyCreateRequest, 
    id?: string, 
    isEdit?: boolean
): Promise<void> => {
    const url = isEdit ? `${API_URL}/api/v1/parties/${id}` : `${API_URL}/api/v1/parties`;
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        throw new ApiError('パーティの保存に失敗しました',0);
    }
};