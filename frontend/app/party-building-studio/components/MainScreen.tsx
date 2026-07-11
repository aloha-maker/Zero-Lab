import React, { useState } from 'react';
import { Step1Page } from '@/features/season/components/step1'
import { Step2Page } from './pages/step2';
import { Step3Page } from './pages/step3';
import { useSeasonData } from '@/features/season/components/step1/hooks/useSeasonData';
import { MatrixResultRow } from "@/app/types/api"; 
import { ConfiguredMainPokemon } from './pages/step2/types';
import { PokemonCandidate } from './pages/step3/types';

// Propsの型定義に入力値関連を追加
interface MainScreenProps {
  currentPage: number;
  inputValue: string;
  onValueChange: (value: string) => void;
  matrixData: MatrixResultRow[];
  onMatrixCalculated: (data: MatrixResultRow[]) => void;
  mainPokemon: ConfiguredMainPokemon | null;
  onMainPokemonChange: (pokemon: ConfiguredMainPokemon | null) => void;
  isScreened: boolean;
  candidates: PokemonCandidate[];
  onScreeningComplete: (filteredResults: PokemonCandidate[]) => void;
}

export const MainScreen: React.FC<MainScreenProps> = ({ 
  currentPage, 
  inputValue, 
  onValueChange,
  matrixData,
  onMatrixCalculated,
  mainPokemon,
  onMainPokemonChange,
  isScreened,       // ★受け取る
  candidates,       // ★受け取る
  onScreeningComplete // ★受け取る
}) => {
  // step1の状態を維持する
  const seasonData = useSeasonData();

  const renderContent = () => {
    switch (currentPage) {
      case 1:
        return <Step1Page seasonData={seasonData} />;
      case 2:
        return (
          <Step2Page 
            matrixData={matrixData}
            onMatrixCalculated={onMatrixCalculated}
            mainPokemon={mainPokemon}
            onMainPokemonChange={onMainPokemonChange}
          />
        );
        case 3: // ★ case 3 を適切に定義
          return (
            <Step3Page 
              matrixData={matrixData}
              isScreened={isScreened}
              candidates={candidates}
              onScreeningComplete={onScreeningComplete}
            />
          );
      default:
        // return <Step1Page inputValue={inputValue} onValueChange={onValueChange} />;
        return
    }
  };

  return (
    <main style={{ flex: 1, padding: '15px', backgroundColor: '#fff' }}>
      {renderContent()}
    </main>
  );
};