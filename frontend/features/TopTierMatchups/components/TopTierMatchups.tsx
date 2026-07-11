// frontend/features/TopTierMatchups/components/TopTierMatchups.tsx
'use client';

import React from 'react';
import { AddPokemonModal } from '@/features/bulids/components/AddPokemonModal';
import { StatFormModal } from '@/features/parties/components/StatFormModal';
import { PartyMemberCard } from '@/features/parties/components/PartyMemberCard';
import MatchupMatrixSection from './MatchupMatrixSection';
import ArchetypeDeterminationSection from './ArchetypeDeterminationSection';
import { ConfiguredMainPokemon, MatrixResultRow } from '../types';
import { useMainPokemonManager } from '../hooks/useMainPokemonManager';

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
  onMainPokemonChange,
}) => {
  const {
    pokemonInfo,
    savedBuild,
    hasSelection,
    isAddModalOpen,
    isStatModalOpen,
    activeBuildId,
    activePokemonInfo,
    openAddModal,
    closeAddModal,
    closeStatModal,
    handleEdit,
    handleDelete,
    handleSearchSuccess,
    handleSavedSelect,
    handleStatModalSuccess,
  } = useMainPokemonManager({ mainPokemon, onMainPokemonChange });

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <p className="text-sm text-gray-500">
          {hasSelection ? 'メインポケモンが設定されています。' : 'メインポケモンを追加してください。'}
        </p>
        <button
          type="button"
          onClick={openAddModal}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2 flex-shrink-0"
        >
          <span role="img" aria-label="monster-ball">🔴</span>
          ポケモンを追加
        </button>
      </div>

      {hasSelection && savedBuild ? (
        <PartyMemberCard
          pokemon={savedBuild}
          pokemonInfo={pokemonInfo}
          onEdit={handleEdit}
          onDelete={() => {
            if (window.confirm('このポケモンをクリアしますか？')) handleDelete();
          }}
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
          ポケモンを検索してください。
        </div>
      )}

      <AddPokemonModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        onSearchSuccess={handleSearchSuccess}
        onSavedSelect={handleSavedSelect}
      />

      <StatFormModal
        isOpen={isStatModalOpen}
        onClose={closeStatModal}
        buildId={activeBuildId}
        pokemonInfo={activePokemonInfo}
        onSuccess={handleStatModalSuccess}
      />

      <MatchupMatrixSection
        mainPokemonName={mainPokemon?.name || ''}
        selectedNatureName={mainPokemon?.nature?.name || ''}
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