import React from 'react';
import { useState } from "react";
import PokemonConfigSection from "./step2/PokemonConfigSection";
import MatchupMatrixSection from "./step2/MatchupMatrixSection";
import ArchetypeDeterminationSection from "./step2/ArchetypeDeterminationSection";
import { ConfiguredMainPokemon } from "./step2/types";
import { MatrixResultRow } from "@/app/types/api";

interface Step2PageProps {
  matrixData: MatrixResultRow[];
  onMatrixCalculated: (data: MatrixResultRow[]) => void;
  mainPokemon: ConfiguredMainPokemon | null;
  onMainPokemonChange: (pokemon: ConfiguredMainPokemon | null) => void;
}

export const Step2Page: React.FC<Step2PageProps> = ({ 
  matrixData = [], 
  onMatrixCalculated,
  mainPokemon,
  onMainPokemonChange
}) => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4">
      {/* 1. ポケモン設定セクション */}
      <PokemonConfigSection 
        selectedPokemon={mainPokemon}
        onPokemonConfigComplete={(data) => onMainPokemonChange(data)}
      />

      {/* 2. 有利不利マトリクスセクション */}
      <MatchupMatrixSection 
        mainPokemonName={mainPokemon?.name || ""}
        selectedNatureName={mainPokemon?.nature?.name || ""}
        evs={mainPokemon?.evs || {}}
        onMatrixCalculated={onMatrixCalculated}
        initialMatrixData={matrixData}
      />

      {/* 3. 戦術アーキタイプ判定セクション */}
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