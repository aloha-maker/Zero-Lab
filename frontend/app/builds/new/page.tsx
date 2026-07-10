// frontend/app/builds/new/page.tsx
'use client';

import React, { useState } from 'react';
import { PokemonCard } from '@/features/bulids/components/BuildFormCard';
import PokemonSearchForm from '@/features/pokedex/components/PokemonSearchForm'; 
import { PokemonInfo } from '@/features/pokedex/types'; 

export default function PokemonCardDevPage() {
  const [currentPokemonInfo, setCurrentPokemonInfo] = useState<PokemonInfo | undefined>(undefined);

  return (
    <main className="min-h-screen bg-slate-100 p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <h1 className="text-xl font-bold mb-6 text-gray-700">🧪 新規ポケモン登録</h1>
        
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          
          <div className="w-full sm:w-96 flex-shrink-0 z-10 relative">
            <PokemonSearchForm
              onSearchStart={() => console.log('検索を開始します...')}
              onSearchSuccess={(data: PokemonInfo) => {
                setCurrentPokemonInfo(data);
              }}
              onSearchError={(msg) => alert(`エラー: ${msg}`)}
            />
          </div>
        </div>

        {currentPokemonInfo ? (
          <PokemonCard
            pokemonInfo={currentPokemonInfo}
            onDelete={() => {
              if (window.confirm('このポケモンをクリアしますか？')) {
                setCurrentPokemonInfo(undefined);
              }
            }}
          />
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
            ポケモンを検索するか、登録済みから呼び出してください。
          </div>
        )}
        
      </div>
    </main>
  );
}