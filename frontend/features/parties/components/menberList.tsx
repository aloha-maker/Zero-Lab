'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { TrainedPokemon } from '../../bulids/types/mock';
import { PokemonInfo } from '../../pokedex/types';
import { PokemonCard } from '../../bulids/components/BuildFormCard'

import { AddPokemonModal } from './AddPokemonModal';
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
    baseStats: { H: 91, A: 134, B: 95, C: 100, D: 100, S: 80 },
    evs: { H: 4, A: 252, B: 0, C: 0, D: 0, S: 252 },
    actualStats: { H: 167, A: 204, B: 115, C: 108, D: 120, S: 132 },
    notes: '竜舞からの全抜きエース。',
    imageUrl: '',
  }
];

export const TrainedList = () => {
  const [party, setParty] = useState<TrainedPokemon[]>(initialParty);
  
  // モーダルの開閉状態
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

  // ★ 検索成功時：バックエンドのデータを元に、編集ステートを初期化して育成フォームを開く
  const handleSearchSuccess = (data: PokemonInfo) => {
    const newPokemon: Partial<TrainedPokemon> = {
      id: crypto.randomUUID(), // 新規ID
      species: data.name || '不明',
      nickname: '',
      item: '',
      ability: '',
      teraType: 'ノーマル',
      moves: ['', '', '', ''],
      // 実際にはAPIからの種族値を設定します（今回はモック値）
      baseStats: { H: 100, A: 100, B: 100, C: 100, D: 100, S: 100 }, 
      evs: { H: 0, A: 0, B: 0, C: 0, D: 0, S: 0 },
      actualStats: { H: 100, A: 100, B: 100, C: 100, D: 100, S: 100 },
      notes: '',
      imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.id || 1}.png`,
    };
    
    setEditingPokemon(newPokemon);
  };

  // ★ 育成フォームから保存された時の処理
  const handleSavePokemon = (pokemon: TrainedPokemon) => {
    setParty(prev => {
        // もし既存のIDなら更新、新規なら末尾に追加
        const exists = prev.find(p => p.id === pokemon.id);
        if (exists) {
            return prev.map(p => p.id === pokemon.id ? pokemon : p);
        }
        return [...prev, pokemon];
    });
    setEditingPokemon(null); // モーダルを閉じる
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
          {/* パーティ読込ボタン */}
          <button 
            onClick={() => setIsPartyModalOpen(true)}
            className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all shadow-sm bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
          >
            <span role="img" aria-label="folder">📁</span>
            パーティ読込
          </button>
          
          {/* ポケモン追加ボタン */}
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
        {/* 登録済みポケモンのリスト */}
        {party.map(pokemon => (
          <PokemonCard 
            key={pokemon.id} 
            pokemon={pokemon} 
            onEdit={() => handleEdit(pokemon.id)}
            onDelete={() => handleDelete(pokemon.id)}
          />
        ))}

        {/* 6匹未満の場合は空きスロット（プレースホルダー）を表示し、直感的な追加導線にする */}
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

      {/* 分離したモーダルコンポーネントを配置 */}
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