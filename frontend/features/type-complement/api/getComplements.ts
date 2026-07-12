// src/features/type-complement/api/getComplements.ts
import { apiClient } from '@/lib/api-client';
import { ComplementaryResponse } from '../types';

/**
 * 主軸ポケモンのIDを渡し、相性補完ポケモンのリストを取得する
 */
export const getComplements = async (basePokemonId: number): Promise<ComplementaryResponse> => {
  return await apiClient.get<ComplementaryResponse>(`/type_matchup/complements/${basePokemonId}`);
};