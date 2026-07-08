// frontend/app/builds2/page.tsx
'use client';

import React, { useState } from 'react';
// ★ Stats 型をインポートに追加
import { PokemonCard } from '@/features/bulids/components/BuildFormCard';
import { TrainedPokemon, Stats } from '@/features/bulids/types/mock';
import PokemonSearchForm from '@/features/pokedex/components/PokemonSearchForm'; 
import { PokemonInfo } from '@/features/pokedex/types'; 

export default function PokemonCardDevPage() {
  const [currentPokemon, setCurrentPokemon] = useState<TrainedPokemon | null>(null);
  const [currentPokemonInfo, setCurrentPokemonInfo] = useState<PokemonInfo | undefined>(undefined);

  const handleLoadSaved = () => {
    alert('過去に登録した「育成済みポケモン」の一覧ダイアログを開き、選択したデータをロードします。');
  };

  return (
    <main className="min-h-screen bg-slate-100 p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <h1 className="text-xl font-bold mb-6 text-gray-700">🧪 PokemonCard 単体テスト & 検索画面</h1>
        
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          
          <div className="w-full sm:w-96 flex-shrink-0 z-10 relative">
            <PokemonSearchForm
              onSearchStart={() => console.log('検索を開始します...')}
              
              onSearchSuccess={(data: PokemonInfo) => {
                setCurrentPokemonInfo(data);
                
                // ★ Stats型の必須プロパティを満たすための初期値オブジェクトを1つだけ定義
                const defaultStats: Stats = {
                  HP: 0, attack: 0, defense: 0, sp_attack: 0, sp_defense: 0, speed: 0
                };

                const newPokemon: TrainedPokemon = {
                  id: String(data.id || Date.now()),
                  nickname: '',
                  species: data.name,
                  item: '',
                  ability: data.abilities?.[0] || '未設定',
                  teraType: data.types?.[0] || '未設定',
                  moves: [],
                  
                  // ★ Record<string, number> を Stats 型にキャストしてエラーを回避
                  baseStats: (data.base_stats as unknown as Stats) || { ...defaultStats },
                  
                  evs: { ...defaultStats },
                  actualStats: { ...defaultStats },
                  
                  notes: '',
                  imageUrl: data.image_url || '',
                };
                
                setCurrentPokemon(newPokemon);
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

        {currentPokemon ? (
          <PokemonCard
            pokemon={currentPokemon}
            pokemonInfo={currentPokemonInfo}
            onChange={setCurrentPokemon}
            onDelete={() => {
              if (window.confirm('このポケモンをクリアしますか？')) {
                setCurrentPokemon(null);
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