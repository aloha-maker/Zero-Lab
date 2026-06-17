"use client";

import { useState } from "react";
import PokemonConfigSection from "./components/PokemonConfigSection";
import MatchupMatrixSection from "./components/MatchupMatrixSection";
import { ConfiguredMainPokemon } from "../types";

export default function Step2Screen() {
  // 親が主軸ポケモンの確定状態（State）を一元管理する
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
          // ※必要に応じて、mainPokemon.realStats(素早さ等)を使った初期計算用のbaseMatchupsをここに仕込めます
        />
      )}
    </div>
  );
}