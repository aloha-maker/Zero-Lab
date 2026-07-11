import React, { useState } from 'react';
import { SeasonDataPage } from '@/features/season/components/SeasonDataPage'
import { TopTierMatchups } from '@/features/TopTierMatchups/components/TopTierMatchups';
import { CandidateScreening } from '@/features/candidate-screening/components/CandidateScreening';
import { useSeasonData } from '@/features/season/hooks/useSeasonData';
import { ConfiguredMainPokemon,MatrixResultRow } from '@/features/TopTierMatchups/types/index';
import { PokemonCandidate } from '@/features/candidate-screening/types';

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
  isScreened,
  candidates,
  onScreeningComplete
}) => {
  // step1の状態を維持する
  const seasonData = useSeasonData();

  const renderContent = () => {
    switch (currentPage) {
      case 1:
        return <SeasonDataPage seasonData={seasonData} />;
      case 2:
        return (
          <TopTierMatchups 
            matrixData={matrixData}
            onMatrixCalculated={onMatrixCalculated}
            mainPokemon={mainPokemon}
            onMainPokemonChange={onMainPokemonChange}
          />
        );
        case 3:
          return (
            <CandidateScreening 
              matrixData={matrixData}
              isScreened={isScreened}
              candidates={candidates}
              onScreeningComplete={onScreeningComplete}
              mainPokemon={mainPokemon}
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