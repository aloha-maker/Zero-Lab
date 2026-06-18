"use client";

import { useState } from "react";
import PokemonConfigSection from "./components/PokemonConfigSection";
import MatchupMatrixSection from "./components/MatchupMatrixSection";
import ArchetypeDeterminationSection from "./components/ArchetypeDeterminationSection"; // ★追加
import { ConfiguredMainPokemon } from "../types";
import { MatrixResultRow } from "@/app/types/api";

export default function Step2Screen() {
  // 親が主軸ポケモンの確定状態（State）を一元管理する
  const [mainPokemon, setMainPokemon] = useState<ConfiguredMainPokemon | null>(null);
  
  // ★追加：マトリクスの計算結果を親でも管理する
  const [matrixData, setMatrixData] = useState<MatrixResultRow[]>([]);

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
          // ★追加：子コンポーネントで計算が終わったら、結果を親のStateに保存する
          onMatrixCalculated={(data) => setMatrixData(data)}
        />
      )}

      {/* 3. 戦術アーキタイプ判定セクション */}
      {/* マトリクスの計算が完了（matrixDataが存在）したタイミングで表示する */}
      {mainPokemon && matrixData.length > 0 && (
        <ArchetypeDeterminationSection 
          mainPokemonName={mainPokemon.name}
          // ※ConfiguredMainPokemonの型定義にtags(string[])が含まれている前提です
          tags={mainPokemon.tags || []} 
          matrixData={matrixData}
        />
      )}
    </div>
  );
}