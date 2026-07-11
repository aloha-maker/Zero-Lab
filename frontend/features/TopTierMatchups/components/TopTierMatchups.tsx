'use client';

import React, { useState } from 'react';
import { PokemonCard } from "@/features/bulids/components/BuildFormCard";
import PokemonSearchForm from "@/features/pokedex/components/PokemonSearchForm";
import { PokemonInfo } from "@/features/pokedex/types";
import MatchupMatrixSection from "./MatchupMatrixSection";
import ArchetypeDeterminationSection from "./ArchetypeDeterminationSection";
import { ConfiguredMainPokemon,MatrixResultRow } from "../types";
import { NATURES } from "@/features/stat-calculator/types";

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
  const [currentPokemonInfo, setCurrentPokemonInfo] = useState<PokemonInfo | undefined>(
    mainPokemon?.pokemonInfo ?? undefined
  );

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
        H: data.evs?.H ?? 0, A: data.evs?.A ?? 0, B: data.evs?.B ?? 0,
        C: data.evs?.C ?? 0, D: data.evs?.D ?? 0, S: data.evs?.S ?? 0,
      },
      realStats: mainPokemon?.realStats ?? { H: null, A: null, B: null, C: null, D: null, S: null },
      tags: [],
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-96 flex-shrink-0 z-10 relative">
          <PokemonSearchForm
            onSearchStart={() => {}}
            onSearchSuccess={(data: PokemonInfo) => setCurrentPokemonInfo(data)}
            onSearchError={(msg) => alert(`エラー: ${msg}`)}
          />
        </div>
      </div>

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

      <MatchupMatrixSection 
        mainPokemonName={mainPokemon?.name || ""}
        selectedNatureName={mainPokemon?.nature?.name || ""}
        evs={mainPokemon?.evs || {}}
        onMatrixCalculated={onMatrixCalculated}
        initialMatrixData={matrixData}
      />

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