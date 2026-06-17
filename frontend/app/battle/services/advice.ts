// frontend/app/battle/services/advice.ts (新規作成、または既存のapiファイルへ追加)

import { BattleAdviceRequest, BattleAdviceResponse } from '../types';
import { API_URL } from "@/app/types/constants";

export async function fetchBattleAdvice(requestData: BattleAdviceRequest): Promise<BattleAdviceResponse> {

  const response = await fetch(`${API_URL}/battles/advice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'AI選出支援の取得に失敗しました。');
  }

  return response.json();
}