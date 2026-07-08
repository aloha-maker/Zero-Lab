// frontend/app/builds/edit/[id]/page.tsx
'use client';

import React, { useState, useEffect, use } from 'react';
import { PokemonCard } from '@/features/bulids/components/BuildFormCard';
import { PokemonInfo } from '@/features/pokedex/types'; 
import { useBuildForm } from '@/features/bulids/hooks/useBuildForm';
import { searchPokemon } from '@/features/pokedex/api/searchPokemon';

interface EditBuildPageProps {
    params: Promise<{ id: string }>;
}

export default function EditBuildPage({ params }: EditBuildPageProps) {
  const { id } = use(params);
  
  const {
    formData,
    setFormData,
    loading,
    saving,
    errorMsg,
    initialPokemonName,
    handleSubmit
  } = useBuildForm({ id });

  const [currentPokemonInfo, setCurrentPokemonInfo] = useState<PokemonInfo | undefined>(undefined);
  const [loadingPokemonInfo, setLoadingPokemonInfo] = useState(false);

  // initialPokemonName が取得できたら、マスタデータを検索して取得する
  useEffect(() => {
    if (!initialPokemonName) return;

    const fetchPokemonInfo = async () => {
      try {
        setLoadingPokemonInfo(true);
        const info = await searchPokemon(initialPokemonName);
        setCurrentPokemonInfo(info);
      } catch (err) {
        console.error("ポケモン情報の取得に失敗しました", err);
      } finally {
        setLoadingPokemonInfo(false);
      }
    };

    fetchPokemonInfo();
  }, [initialPokemonName]);

  if (loading || loadingPokemonInfo) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-md p-8 flex flex-col items-center gap-4">
          <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full" />
          <span className="text-gray-500 font-bold">データを読み込み中...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <h1 className="text-xl font-bold mb-6 text-gray-700">⚔️ ポケモンの調整変更</h1>
        
        {formData.pokemon_id > 0 ? (
          <PokemonCard
            pokemon={formData}
            pokemonInfo={currentPokemonInfo}
            onChange={setFormData}
            onSubmit={handleSubmit}
            saving={saving}
            errorMsg={errorMsg}
            submitLabel="変更を保存する"
          />
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
            ポケモンのデータが見つかりませんでした。
          </div>
        )}
      </div>
    </main>
  );
}