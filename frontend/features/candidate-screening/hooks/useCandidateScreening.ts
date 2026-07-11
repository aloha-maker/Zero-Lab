// frontend/features/candidate-screening/hooks/useCandidateScreening.ts
"use client";

import { useState } from 'react';
import { TypeMatchupRequest, TypeMatchupResponse } from '@/app/types/api';
import { MatrixResultRow } from '@/features/TopTierMatchups/types/index';
import { SeasonPokemonInfo } from '@/features/season/types/index';
import { API_URL } from '@/lib/api-client';
import { PokemonCandidate } from '../types';
import {
  toEnglishTypes,
  isWeaknessOverlapped,
  hasDefenseComplement,
  hasAttackComplement,
} from '../utils/typeMatchup';
import { extractTargetRows, buildDynamicMatchups, resolveFinalCandidates } from '../utils/screeningEngine';

type SeasonPokemonResponse = {
  pokemons: SeasonPokemonInfo[];
};

// 主軸ポケモンの弱点タイプ（本来はStep1/主軸データから動的に受け取る想定）
const MAIN_WEAK_TYPES = ['electric', 'grass'];
const MAX_RESULTS = 5;

async function fetchTypeMultiplier(attacker: string, defenders: string[]): Promise<number> {
  try {
    const reqBody: TypeMatchupRequest = {
      attacker_type: attacker,
      defender_types: defenders.filter(Boolean),
    };
    const res = await fetch(`${API_URL}/api/v1/type_matchup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reqBody),
    });
    if (!res.ok) return 1.0;
    const data: TypeMatchupResponse = await res.json();
    return data.multiplier;
  } catch {
    return 1.0;
  }
}

async function fetchSeasonTopPokemons(): Promise<SeasonPokemonInfo[]> {
  const res = await fetch(`${API_URL}/api/v1/seasons/`);
  if (!res.ok) throw new Error('環境ポケモンの取得に失敗しました');
  const data: SeasonPokemonResponse = await res.json();
  return data.pokemons || [];
}

/**
 * フェーズ2（機械的スクリーニング）〜フェーズ3（選出ルール判定）を実行するフック。
 * API通信・ローディング状態の管理をここに集約し、コンポーネント側は表示に専念する。
 */
export function useCandidateScreening(onScreeningComplete: (candidates: PokemonCandidate[]) => void) {
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');

  const runScreening = async (matrixData: MatrixResultRow[]) => {
    if (matrixData.length === 0) {
      alert('フェーズ1のデータが存在しません。');
      return;
    }

    setLoading(true);
    setStatusText('環境TOP50データを取得中...');

    try {
      const topPokemons = await fetchSeasonTopPokemons();
      const targetRows = extractTargetRows(matrixData);
      const allTargets = targetRows.map((r) => r.opponent_name);
      const dynamicMatchups = buildDynamicMatchups(targetRows);

      setStatusText('相性計算を並列実行中（高速処理）...');

      // 💡 全ポケモンの全相性テストを Promise.all で並列処理に投げる
      const screeningPromises = topPokemons.map(async (pokemon): Promise<PokemonCandidate | null> => {
        const defenderTypesEn = toEnglishTypes(pokemon.types);

        // 耐性チェックの並列化
        const defenseMultipliers = await Promise.all(
          MAIN_WEAK_TYPES.map((weakType) => fetchTypeMultiplier(weakType, defenderTypesEn))
        );

        if (isWeaknessOverlapped(defenseMultipliers) || !hasDefenseComplement(defenseMultipliers)) {
          return null; // スクリーニング対象外
        }

        // 攻撃チェックの並列化（自身の各タイプが仮想ターゲットに有効かどうか）
        const attackMultipliers = await Promise.all(
          defenderTypesEn.map((myType) => fetchTypeMultiplier(myType, ['normal']))
        );

        if (!hasAttackComplement(attackMultipliers)) return null;

        return {
          name: pokemon.name,
          matchups: dynamicMatchups,
          archetypeTags: pokemon.types.map((t) => `${t}タイプ`),
          passChecks: [
            '[フェーズ2] 弱点重複なし ＆ 耐性補完パス',
            '[フェーズ2] 攻撃補完（環境打点）クリア',
          ],
          rate: Math.min(100, Math.floor((pokemon.base_stats.hp + pokemon.base_stats.speed) / 2.5)),
          badgeColor: 'bg-blue-100 text-blue-700',
        };
      });

      const results = await Promise.all(screeningPromises);
      const phase2Passed = results.filter((c): c is PokemonCandidate => c !== null);

      if (phase2Passed.length > 0) {
        setStatusText('単体補完不可の場合に備え、2匹の最適な組み合わせを計算中...');
      }

      // フェーズ3：選出ルールの判定（単体優先、なければペア）
      const finalCandidates = resolveFinalCandidates(phase2Passed, allTargets);

      onScreeningComplete(finalCandidates.slice(0, MAX_RESULTS));
    } catch (err) {
      console.error(err);
      alert('エラーが発生しました。');
    } finally {
      setLoading(false);
      setStatusText('');
    }
  };

  return { loading, statusText, runScreening };
}
