'use client';

import React, { useEffect, useState } from 'react';
import { useBattleStore } from '../store/useBattleStore';
import { SeasonResponse } from '../../types/api';
import { API_URL } from '@/lib/api-client';

export const SeasonSelector = () => {
  const [seasons, setSeasons] = useState<SeasonResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { seasonId, setSeason } = useBattleStore();

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/seasons/`);
        if (!res.ok) throw new Error('Failed to fetch seasons');
        const data: SeasonResponse[] = await res.json();
        setSeasons(data);

        // 初期値：最初のシーズン（start_date降順で返ってくるので最新シーズン）を自動選択
        if (data.length > 0) {
          setSeason(data[0].id, data[0].rule_id);
        }
      } catch (err) {
        console.error('Failed to fetch seasons', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSeasons();
  }, [setSeason]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(e.target.value);
    if (!selectedId) {
      setSeason(null, null);
      return;
    }
    const selected = seasons.find((s) => s.id === selectedId);
    if (selected) {
      setSeason(selected.id, selected.rule_id);
    }
  };

  return (
    <div className="p-4 border rounded-md bg-gray-800 border-gray-700 shadow-sm mb-4">
      <label className="block text-sm font-medium text-white mb-2">対象シーズン</label>
      <select
        value={seasonId ?? ''}
        onChange={handleChange}
        disabled={isLoading}
        className="w-full p-2 border rounded-md bg-gray-900 text-white border-gray-600 disabled:opacity-50"
      >
        <option value="">-- シーズンを選択してください --</option>
        {seasons.map((season) => (
          <option key={season.id} value={season.id}>
            {season.name}
            {season.rule?.name ? `（${season.rule.name}）` : ''}
          </option>
        ))}
      </select>
    </div>
  );
};