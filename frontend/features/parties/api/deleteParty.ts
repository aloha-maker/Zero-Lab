import { API_URL } from '@/lib/api-client';
import { ApiError } from '@/lib/api-client';

export const deleteParty = async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/api/v1/parties/${id}`, { method: 'DELETE' });
    
    if (!res.ok) {
        throw new ApiError(`パーティの削除に失敗しました: ${res.statusText}`,0);
    }
};