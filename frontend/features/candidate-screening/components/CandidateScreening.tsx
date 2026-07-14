// frontend/features/candidate-screening/components/CandidateScreening.tsx
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { ConfiguredMainPokemon, MatrixResultRow } from '@/features/TopTierMatchups/types/index';
import { PokemonCandidate } from '../types';
import Phase1TargetList from './Phase1TargetList';

import ComplementaryPokemonResult from '@/features/type-complement/components/ComplementaryPokemonResult';
import MatchupFilterSection from '@/features/matchup-filter/components/MatchupFilterSection';
import MutualComplementSection from '@/features/mutual-complement/components/MutualComplementSection';

interface CandidateScreeningProps {
  matrixData: MatrixResultRow[];
  isScreened: boolean;
  candidates: PokemonCandidate[];
  onScreeningComplete: (filteredResults: PokemonCandidate[]) => void;
  mainPokemon: ConfiguredMainPokemon | null;
}

export const CandidateScreening: React.FC<CandidateScreeningProps> = ({ 
  matrixData,
  isScreened, 
  candidates,
  onScreeningComplete,
  mainPokemon
}) => {
  const [complementResult, setComplementResult] = useState<any>(null);
  const [isFetchingComplements, setIsFetchingComplements] = useState(false);

  // 【修正1】配列の毎回生成を防ぐため useMemo でキャッシュする
  const weakTargets = useMemo(() => {
    return matrixData.filter(
      (row) => row.judgment === "△" || row.judgment === "×"
    );
  }, [matrixData]);

  const handleStartScreening = () => {
    setIsFetchingComplements(true);
  };

  // 【修正2】前回送ったデータを記憶しておくためのRef
  const prevMappedRef = useRef<string | null>(null);

  const handleFilterComplete = useCallback((result: any) => {
    let targetArray = [];
    if (Array.isArray(result)) {
      targetArray = result;
    } else if (result && Array.isArray(result.filtered_candidates)) {
      targetArray = result.filtered_candidates;
    }

    const mappedCandidates: PokemonCandidate[] = targetArray.map((c: any) => ({
      id: c.id,
      name: c.name,
      rate: 100,
      badgeColor: "bg-blue-100 text-blue-700",
      archetypeTags: [],
      matchups: {} as any,
      passChecks: []
    }));

    // 【修正3】前回のデータと中身を比較し、完全に一致していれば親への通知を止める（無限ループの遮断）
    const currentStringified = JSON.stringify(mappedCandidates);
    if (prevMappedRef.current === currentStringified) {
      return;
    }
    prevMappedRef.current = currentStringified;

    onScreeningComplete(mappedCandidates);
  }, [onScreeningComplete]);

  return (
    <section className="space-y-6 max-w-4xl mx-auto p-4 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
            ⚙️ 構築の軸・機械的スクリーニング
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            手順1のマトリクス結果から、ターゲットを自動抽出して補完候補を絞り込みます。
          </p>
        </div>

        <Phase1TargetList matrixData={matrixData} />

        <div className="border-t border-slate-100 pt-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <h4 className="font-bold text-slate-800">相性補完候補の抽出</h4>
              <p className="text-xs text-slate-500 mt-1">
                主軸ポケモンのタイプ耐性を補完できる候補をデータベースから取得し、絞り込みを行います。
              </p>
            </div>
            <button
              onClick={handleStartScreening}
              disabled={isFetchingComplements || !mainPokemon}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              {isFetchingComplements ? "候補取得中..." : "補完候補を取得する"}
            </button>
          </div>
        </div>

        {isFetchingComplements && mainPokemon && (
          <ComplementaryPokemonResult
            basePokemon={mainPokemon.pokemonInfo}
            onResultFetched={setComplementResult}
          />
        )}

        {complementResult && complementResult.complements?.length > 0 && (
          <MatchupFilterSection
            complements={complementResult.complements}
            targets={weakTargets} 
            onFilterComplete={handleFilterComplete}
          />
        )}
      </div>

      {candidates.length > 0 && mainPokemon && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <MutualComplementSection
            basePokemonName={mainPokemon.name}
            baseMatrix={matrixData} 
            filteredCandidates={candidates.map(c => ({ 
              id: c.id || 0, 
              name: c.name 
            }))}
          />
        </div>
      )}
    </section>
  );
};