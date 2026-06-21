"use client";

import React, { useState } from 'react';
import { Header } from './components/Header';
import { LeftSidebar } from './components/LeftSidebar';
import { MainScreen } from './components/MainScreen';
import { RightSidebar } from './components/RightSidebar';
import { MatrixResultRow } from "@/app/types/api";
import { ConfiguredMainPokemon } from "./components/pages/step2/types";
import { PokemonCandidate } from './components/pages/step3/types';

export const Layout: React.FC = () => {
  // 現在のページ状態を管理するState（初期値は 'home'）
  const [currentPage, setCurrentPage] = useState<number>(1);
  // 💡入力した値を保持する共通のState（初期値は空文字）
  const [inputValue, setInputValue] = useState<string>('');
  // Step2で利用し、ページを跨いでも保持したいマトリクスデータ用の共通State（初期値は空配列）
  const [matrixData, setMatrixData] = useState<MatrixResultRow[]>([]);
  // 主軸ポケモンの設定状態を最上流のLayoutで保持する
  const [mainPokemon, setMainPokemon] = useState<ConfiguredMainPokemon | null>(null);
  console.log("=== Layout State ===", { currentPage, mainPokemon, matrixLength: matrixData.length });
  // ★追加: Step3のスクリーニングフラグと候補リストのState
  const [isScreened, setIsScreened] = useState<boolean>(false);
  const [candidates, setCandidates] = useState<PokemonCandidate[]>([]);
  // スクリニング完了時に両方のStateを一度に更新するハンドラー
  const handleScreeningComplete = (filteredResults: PokemonCandidate[]) => {
    setCandidates(filteredResults);
    setIsScreened(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: 'sans-serif', margin: 0 }}>
    
      {/* ヘッダー */}
      <Header />

      {/* 中央セクション */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* 左サイドバー（状態と、状態を変更する関数を渡す） */}
        <div style={{ flex: 1 }}>
          <LeftSidebar
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          />
        </div>
        

        {/* MainScreenに入力値と、それを更新する関数を渡す */}
        <div style={{ flex: 4 }}>
        <MainScreen 
            currentPage={currentPage} 
            inputValue={inputValue} 
            onValueChange={setInputValue}
            matrixData={matrixData}
            onMatrixCalculated={setMatrixData}
            mainPokemon={mainPokemon}
            onMainPokemonChange={setMainPokemon}
            isScreened={isScreened}
            candidates={candidates}
            onScreeningComplete={handleScreeningComplete}
          />
        </div>
        

        {/* 右サイドバー */}
        <div style={{ flex: 2 }}>
          <RightSidebar />
        </div>
        
      </div>
    </div>
  );
};