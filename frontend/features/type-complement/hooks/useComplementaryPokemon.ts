// src/features/type-complement/hooks/useComplementaryPokemon.ts
import { useState, useCallback } from 'react';
import { getComplements } from '../api/getComplements';
import { ComplementaryResponse } from '../types';
import { ApiError } from '@/lib/api-client';

export const useComplementaryPokemon = () => {
  const [data, setData] = useState<ComplementaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComplements = useCallback(async (basePokemonId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getComplements(basePokemonId);
      setData(result);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('予期せぬエラーが発生しました');
      }
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error, fetchComplements };
};