// frontend/app/builds/new/page.tsx
'use client';

import React, { useState } from 'react';
import { PokemonCard } from '@/features/bulids/components/BuildFormCard';
import PokemonSearchForm from '@/features/pokedex/components/PokemonSearchForm'; 
import { PokemonInfo } from '@/features/pokedex/types'; 
import { useBuildForm } from '@/features/bulids/hooks/useBuildForm';

export default function PokemonCardDevPage() {
  const {
    formData,
    setFormData,
    saving,
    errorMsg,
    handlePokemonSelect,
    handleSubmit
  } = useBuildForm();

  const [currentPokemonInfo, setCurrentPokemonInfo] = useState<PokemonInfo | undefined>(undefined);

  const handleLoadSaved = () => {
    alert('過去に登録した「育成済みポケモン」の一覧ダイアログを開き、選択したデータをロードします。');
  };

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
                handlePokemonSelect(data);
              }}
              onSearchError={(msg) => alert(`エラー: ${msg}`)}
            />
          </div>
          
          <button 
            onClick={handleLoadSaved}
            className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-bold transition-colors border border-gray-300 shadow-sm whitespace-nowrap flex items-center gap-2"
          >
            <span role="img" aria-label="folder">📁</span> 登録済みから呼び出す
          </button>
        </div>

        {formData.pokemon_id > 0 ? (
          <PokemonCard
            pokemon={formData}
            pokemonInfo={currentPokemonInfo}
            onChange={setFormData}
            onSubmit={handleSubmit}
            saving={saving}
            errorMsg={errorMsg}
            onDelete={() => {
              if (window.confirm('このポケモンをクリアしますか？')) {
                setFormData({
                  pokemon_id: 0,
                  pokemon_name: "",
                  nickname: "",
                  nature: "",
                  ability: "",
                  item: "",
                  tera_type: "",
                  moves: ["", "", "", ""],
                  evs: { H: 0, A: 0, B: 0, C: 0, D: 0, S: 0 },
                  ivs: { H: 31, A: 31, B: 31, C: 31, D: 31, S: 31 },
                  memo: ""
                });
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