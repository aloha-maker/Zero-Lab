// frontend/features/parties/components/memberList.tsx
'use client';

import React, { useState } from 'react';
import { TrainedPokemon, Stats } from '@/features/bulids/types/mock';
import { PokemonInfo } from '../../pokedex/types';

// API通信を含む PokemonCard ではなく、表示専用のカードをインポートします
import { PartyMemberCard } from './PartyMemberCard'; 
import { AddPokemonModal } from '../../bulids/components/AddPokemonModal';
import { LoadPartyModal } from './LoadPartyModal';
import { StatFormModal } from './StatFormModal';

// 初期データのモック（本来はAPI等から取得）
const initialParty: TrainedPokemon[] = [
  {
    id: '1',
    nickname: 'マルスケカイリュー',
    species: 'カイリュー',
    item: 'いかさまダイス',
    ability: 'マルチスケイル',
    teraType: 'ノーマル',
    moves: ['スケイルショット', 'しんそく', 'じしん', 'りゅうのまい'],
    baseStats: { HP: 91, attack: 134, defense: 95, sp_attack: 100, sp_defense: 100, speed: 80 },
    evs: { HP: 4, attack: 252, defense: 0, sp_attack: 0, sp_defense: 0, speed: 252 },
    actualStats: { HP: 167, attack: 204, defense: 115, sp_attack: 108, sp_defense: 120, speed: 132 },
    notes: '竜舞からの全抜きエース。',
    imageUrl: '', 
  }
];

export const TrainedList = () => {
  const [party, setParty] = useState<TrainedPokemon[]>(initialParty);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
  const [editingPokemon, setEditingPokemon] = useState<Partial<TrainedPokemon> | null>(null);

  const handleEdit = (id: string) => {
    alert('編集機能は開発中です。対象ID: ' + id);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('このポケモンをパーティから削除しますか？')) {
      setParty(party.filter(p => p.id !== id));
    }
  };

  const openAddModal = () => {
    if (party.length >= 6) {
      alert('パーティは最大6匹までです。');
      return;
    }
    setIsAddModalOpen(true);
  };

  const handleLoadSavedPokemon = () => {
    alert('過去に登録した「育成済みポケモン」の一覧ダイアログを開きます。');
    setIsAddModalOpen(false);
  };

  const handleLoadParty = (partyId: string) => {
    if (party.length > 0) {
      if (!window.confirm('現在のパーティは上書きされます。よろしいですか？')) {
        return;
      }
    }
    alert(`選択したパーティ(ID: ${partyId})をロードして画面に反映します。`);
    setIsPartyModalOpen(false);
  };

  const handleSearchSuccess = (data: PokemonInfo) => {
    const defaultStats: Stats = {
      HP: 0, attack: 0, defense: 0, sp_attack: 0, sp_defense: 0, speed: 0
    };

    const newPokemon: Partial<TrainedPokemon> = {
      id: crypto.randomUUID(),
      species: data.name || '不明',
      nickname: '',
      item: '',
      ability: data.abilities?.[0] || '',
      teraType: 'ノーマル',
      moves: ['', '', '', ''],
      baseStats: (data.base_stats as unknown as Stats) || { ...defaultStats },
      evs: { HP: 0, attack: 0, defense: 0, sp_attack: 0, sp_defense: 0, speed: 0 },
      actualStats: { ...defaultStats },
      notes: '',
      imageUrl: data.image_url || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.id || 1}.png`,
    };
    
    setEditingPokemon(newPokemon);
  };

  const handleSavePokemon = (pokemon: TrainedPokemon) => {
    setParty(prev => {
        const exists = prev.find(p => p.id === pokemon.id);
        if (exists) {
            return prev.map(p => p.id === pokemon.id ? pokemon : p);
        }
        return [...prev, pokemon];
    });
    setEditingPokemon(null); 
  };

  return (
    <div className="flex flex-col gap-6 relative">
      <header className="flex flex-col sm:flex-row items-center justify-between mb-8 bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-2">
            <span className="text-3xl">⚔️</span> 
            パーティ管理ツール
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            シーズン10 ランクマッチ用 / 現在 {party.length} / 6 匹
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0 w-full sm:w-auto">
          <button 
            onClick={() => setIsPartyModalOpen(true)}
            className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all shadow-sm bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
          >
            <span role="img" aria-label="folder">📁</span>
            パーティ読込
          </button>
          
          <button 
            onClick={openAddModal}
            disabled={party.length >= 6}
            className={`flex flex-1 sm:flex-none items-center justify-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all shadow-md
              ${party.length >= 6 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg active:scale-95'
              }`}
          >
            <span role="img" aria-label="add">➕</span>
            ポケモン追加
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-6">
        {/* 新しく作成した PartyMemberCard に置き換え */}
        {party.map(pokemon => (
          <PartyMemberCard 
            key={pokemon.id} 
            pokemon={pokemon}
            onEdit={() => handleEdit(pokemon.id)}
            onDelete={() => handleDelete(pokemon.id)}
          />
        ))}

        {party.length < 6 && (
          <button 
            onClick={openAddModal}
            className="w-full text-center py-12 bg-white/50 hover:bg-white rounded-2xl border-2 border-dashed border-gray-300 hover:border-blue-400 transition-all group flex flex-col items-center justify-center gap-3"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
              <span className="text-xl text-gray-400 group-hover:text-blue-500">➕</span>
            </div>
            <p className="text-gray-500 group-hover:text-blue-600 font-bold">ポケモンを追加する（残り {6 - party.length} 枠）</p>
          </button>
        )}
      </div>

      <AddPokemonModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSearchSuccess={handleSearchSuccess}
        onLoadSaved={handleLoadSavedPokemon}
      />

      <LoadPartyModal 
        isOpen={isPartyModalOpen} 
        onClose={() => setIsPartyModalOpen(false)} 
        onLoadParty={handleLoadParty}
      />
      
      <StatFormModal
        isOpen={!!editingPokemon}
        onClose={() => setEditingPokemon(null)}
        initialData={editingPokemon}
        onSave={handleSavePokemon}
      />
    </div>
  );
};