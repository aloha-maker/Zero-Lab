'use client';

import React, { useState } from 'react';
import { PokemonCard } from '@/features/bulids/components/BuildFormCard';
import { TrainedPokemon } from '@/features/bulids/types/mock';

export default function PokemonCardDevPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // テスト用のモックデータ
  const samplePokemon: TrainedPokemon = {
    id: 'test-1',
    nickname: 'マルスケカイリュー',
    species: 'カイリュー',
    item: 'いかさまダイス',
    ability: 'マルチスケイル',
    teraType: 'ノーマル',
    moves: ['スケイルショット', 'しんそく', 'じしん', 'りゅうのまい'],
    baseStats: { H: 91, A: 134, B: 95, C: 100, D: 100, S: 80 },
    evs: { H: 4, A: 252, B: 0, C: 0, D: 0, S: 252 },
    actualStats: { H: 167, A: 204, B: 115, C: 108, D: 120, S: 132 },
    notes: '竜舞からの全抜きエース。\nいかさまダイスでスケイルショットの回数を安定させる。',
    imageUrl: '',
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    // 実際にはここでPokeAPIなどを叩くか、ローカルのマスターデータを検索します
    alert(`「${searchTerm}」の基本データ（種族値など）を検索して反映します。`);
  };

  const handleLoadSaved = () => {
    // 実際には登録済みポケモンの一覧モーダルなどを開きます
    alert('過去に登録した「育成済みポケモン」の一覧ダイアログを開き、選択したデータをロードします。');
  };

  return (
    <main className="min-h-screen bg-slate-100 p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <h1 className="text-xl font-bold mb-6 text-gray-700">🧪 PokemonCard 単体テスト & 検索画面</h1>
        
        {/* 新規追加・検索用UIモック */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex w-full sm:w-auto gap-2">
            <input 
              type="text" 
              placeholder="ポケモン名で検索..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
            <button 
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors whitespace-nowrap shadow-sm"
            >
              <span role="img" aria-label="search">🔍</span> 検索
            </button>
          </div>
          
          <button 
            onClick={handleLoadSaved}
            className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-bold transition-colors border border-gray-300 shadow-sm whitespace-nowrap flex items-center gap-2"
          >
            <span role="img" aria-label="folder">📁</span> 登録済みから呼び出す
          </button>
        </div>

        {/* 表示用カード */}
        <PokemonCard
          pokemon={samplePokemon}
          onEdit={() => console.log('Edit clicked!')}
          onDelete={() => console.log('Delete clicked!')}
        />
        
      </div>
    </main>
  );
}