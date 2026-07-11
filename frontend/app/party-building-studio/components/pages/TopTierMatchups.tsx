'use client';

import React, { useState } from 'react';
import { PokemonCard } from "@/features/bulids/components/BuildFormCard";
import PokemonSearchForm from "@/features/pokedex/components/PokemonSearchForm";
import { PokemonInfo } from "@/features/pokedex/types";
import MatchupMatrixSection from "./step2/MatchupMatrixSection";
import ArchetypeDeterminationSection from "./step2/ArchetypeDeterminationSection";
import { ConfiguredMainPokemon } from "./step2/types";
import { NATURES } from "@/app/types/constants";
import { MatrixResultRow } from "@/app/types/api";

interface Step2PageProps {
  matrixData: MatrixResultRow[];
  onMatrixCalculated: (data: MatrixResultRow[]) => void;
  mainPokemon: ConfiguredMainPokemon | null;
  onMainPokemonChange: (pokemon: ConfiguredMainPokemon | null) => void;
}

export const TopTierMatchups: React.FC<Step2PageProps> = ({ 
  matrixData = [], 
  onMatrixCalculated,
  mainPokemon,
  onMainPokemonChange
}) => {
  // 検索で取得したポケモン情報。既にmainPokemonが設定されていればそれを初期値にする
  const [currentPokemonInfo, setCurrentPokemonInfo] = useState<PokemonInfo | undefined>(
    mainPokemon?.pokemonInfo ?? undefined
  );

  // BuildFormCard(PokemonCard)がビルドを保存した際に呼ばれる。
  // 保存結果(data)をConfiguredMainPokemonの形に変換して、下流セクション(マッチアップ表・アーキタイプ判定)へ渡す。
  // ※ data の実際のフィールド構成は useBuildForm.handleSubmit の戻り値/onSuccess 引数に依存するため、
  //    実装に合わせて下記のマッピングは要調整。
  const handleBuildSuccess = (data: any) => {
    if (!currentPokemonInfo) {
      console.warn("pokemonInfoが未設定のため、ConfiguredMainPokemonへの反映をスキップしました");
      return;
    }

    const nature = NATURES.find(n => n.name === data.nature) ?? NATURES[22];

    onMainPokemonChange({
      name: data.pokemon_name,
      pokemonInfo: currentPokemonInfo,
      nature,
      evs: {
        H: data.evs?.H ?? 0,
        A: data.evs?.A ?? 0,
        B: data.evs?.B ?? 0,
        C: data.evs?.C ?? 0,
        D: data.evs?.D ?? 0,
        S: data.evs?.S ?? 0,
      },
      // 実数値計算はPokemonConfigSection側の機能だったため、BuildFormCardには無い。
      // マッチアップ計算等で実数値が必須であれば別途手当てが必要。
      realStats: mainPokemon?.realStats ?? { H: null, A: null, B: null, C: null, D: null, S: null },
      // タグ付け機能は廃止したため常に空配列
      tags: [],
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4">
      {/* 1. ポケモン検索セクション */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-96 flex-shrink-0 z-10 relative">
          <PokemonSearchForm
            onSearchStart={() => {}}
            onSearchSuccess={(data: PokemonInfo) => setCurrentPokemonInfo(data)}
            onSearchError={(msg) => alert(`エラー: ${msg}`)}
          />
        </div>
      </div>

      {/* 2. ポケモン設定セクション（PokemonConfigSection → BuildFormCardに置き換え） */}
      {currentPokemonInfo ? (
        <PokemonCard
          pokemonInfo={currentPokemonInfo}
          onSuccess={handleBuildSuccess}
          onDelete={() => {
            if (window.confirm('このポケモンをクリアしますか？')) {
              setCurrentPokemonInfo(undefined);
              onMainPokemonChange(null);
            }
          }}
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
          ポケモンを検索してください。
        </div>
      )}

      {/* 3. 有利不利マトリクスセクション */}
      <MatchupMatrixSection 
        mainPokemonName={mainPokemon?.name || ""}
        selectedNatureName={mainPokemon?.nature?.name || ""}
        evs={mainPokemon?.evs || {}}
        onMatrixCalculated={onMatrixCalculated}
        initialMatrixData={matrixData}
      />

      {/* 4. 戦術アーキタイプ判定セクション */}
      {mainPokemon && matrixData.length > 0 && (
        <ArchetypeDeterminationSection 
          mainPokemonName={mainPokemon.name}
          tags={mainPokemon.tags || []} 
          matrixData={matrixData}
        />
      )}
    </div>
  );
};