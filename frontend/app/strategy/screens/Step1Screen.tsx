"use client";

import { useState } from "react";
import PokemonConfigSection from "./components/PokemonConfigSection";
import MatchupMatrixSection from "./components/MatchupMatrixSection";
import ArchetypeDeterminationSection from "./components/ArchetypeDeterminationSection";
import { ConfiguredMainPokemon } from "../types";
import { MatrixResultRow } from "@/app/types/api";

interface Step1ScreenProps {
  matrixData: MatrixResultRow[];
  onMatrixCalculated: (data: MatrixResultRow[]) => void;
}

export default function Step1Screen({ matrixData, onMatrixCalculated }: Step1ScreenProps) {
  // 主軸ポケモンの設定状態
  const [mainPokemon, setMainPokemon] = useState<ConfiguredMainPokemon | null>(null);

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4">
      {/* 1. ポケモン設定セクション */}
      <PokemonConfigSection 
        selectedPokemon={mainPokemon}
        onPokemonConfigComplete={(data) => setMainPokemon(data)}
      />

      {/* 2. 有利不利マトリクスセクション */}
      {mainPokemon && (
        <MatchupMatrixSection 
          mainPokemonName={mainPokemon.name}
          selectedNatureName={mainPokemon.nature.name}
          evs={mainPokemon.evs}
          onMatrixCalculated={onMatrixCalculated} // 親の更新関数を呼ぶ
          initialMatrixData={matrixData} // ★タブを往復した時に消えないように渡す
        />
      )}

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
}