// frontend/features/candidate-screening/components/CandidateScreening.tsx
import React, { useState, useCallback } from 'react';
import { ConfiguredMainPokemon, MatrixResultRow } from '@/features/TopTierMatchups/types/index';
import { PokemonCandidate } from '../types';
import Phase1TargetList from './Phase1TargetList';

// 【追加】新規フロー用のコンポーネントをインポート
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
  isScreened, // 今回は candidates.length > 0 で表示判定するため使用しませんがPropsとして維持
  candidates,
  onScreeningComplete,
  mainPokemon
}) => {
  // ①のAPI（相性補完候補）の結果を保持するローカルステート
  const [complementResult, setComplementResult] = useState<any>(null);
  
  // Phase2のボタンが押され、①のAPIを走らせているかどうかのフラグ
  const [isFetchingComplements, setIsFetchingComplements] = useState(false);

  // 主軸の実際のマトリクスデータから、苦手な相手（△・×）だけを抽出
  const weakTargets = matrixData.filter(
    (row) => row.judgment === "△" || row.judgment === "×"
  );

  // フェーズ2：スクリーニング開始ボタンの処理
  const handleStartScreening = () => {
    setIsFetchingComplements(true);
  };

  // ②の絞り込み完了時、データをMainScreenへ引き上げる
  const handleFilterComplete = useCallback((result: any) => {
    let targetArray = [];
    if (Array.isArray(result)) {
      targetArray = result;
    } else if (result && Array.isArray(result.filtered_candidates)) {
      targetArray = result.filtered_candidates;
    }

    // MainScreenの候補リスト(PokemonCandidate[])の型に合わせて不足プロパティを補完
    const mappedCandidates: PokemonCandidate[] = targetArray.map((c: any) => ({
      id: c.id,
      name: c.name,
      rate: 100,
      badgeColor: "bg-blue-100 text-blue-700", // 必須プロパティの初期値
      archetypeTags: [],
      matchups: {} as any, // 既存のMatchups型に合わせて適宜調整
      passChecks: []
    }));

    // 親コンポーネント(MainScreen)のStateを更新
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

        {/* フェーズ1: ターゲットリストの表示（既存そのまま） */}
        <Phase1TargetList matrixData={matrixData} />

        {/* フェーズ2: スクリーニング開始トリガー（ボタンをインライン化） */}
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

        {/* ① 相性補完候補の取得（ボタン押下後に実行） */}
        {isFetchingComplements && mainPokemon && (
          <ComplementaryPokemonResult
            basePokemon={mainPokemon.pokemonInfo}
            onResultFetched={setComplementResult}
          />
        )}

        {/* ② 苦手な相手で絞り込む（マトリクスフィルタ） */}
        {complementResult && complementResult.complements?.length > 0 && (
          <MatchupFilterSection
            complements={complementResult.complements}
            targets={weakTargets} // 実データ(△×のみ)を渡す
            onFilterComplete={handleFilterComplete}
          />
        )}
      </div>

      {/* 下部：ランキングテーブルUI */}
      {candidates.length > 0 && mainPokemon && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <MutualComplementSection
            basePokemonName={mainPokemon.name}
            baseMatrix={matrixData}
            // 型定義に id が追加されたので、素直に c.id を参照できます
            // 万が一 undefined の場合は 0 をフォールバックとして渡す
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