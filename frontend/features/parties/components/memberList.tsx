// frontend/features/parties/components/memberList.tsx
'use client';

import React, { useState } from 'react';
import { BuildCreateRequest } from '@/features/bulids/types';
import { PokemonInfo } from '../../pokedex/types';
import { PartyResponse } from '@/features/parties/types';

// API通信を含む PokemonCard ではなく、表示専用のカードをインポートします
import { PartyMemberCard } from './PartyMemberCard';
import { AddPokemonModal } from '../../bulids/components/AddPokemonModal';
import { LoadPartyModal } from './LoadPartyModal';
import { StatFormModal } from './StatFormModal';

// ------------------------------------------------------------------
// BuildCreateRequest には「パーティ内での一意ID」や「画像・種族値などの
// マスタデータ(PokemonInfo)」が含まれていないため、このコンポーネント内では
// その2つを合わせて1つのパーティメンバーとして管理します。
// entryId はフロントエンドでの管理用ID（保存時はサーバー側のIDに置き換わる想定）。
// ------------------------------------------------------------------
interface PartyMemberEntry {
  entryId: string;
  pokemon: BuildCreateRequest;
  pokemonInfo?: PokemonInfo;
}

// 初期データのモック（本来はAPI等から取得）
const initialParty: PartyMemberEntry[] = [
  {
    entryId: '1',
    pokemon: {
      pokemon_id: 1,
      pokemon_name: 'カイリュー',
      nickname: 'マルスケカイリュー',
      item: 'いかさまダイス',
      ability: 'マルチスケイル',
      tera_type: 'ノーマル',
      nature: 'ようき',
      moves: ['スケイルショット', 'しんそく', 'じしん', 'りゅうのまい'],
      evs: { H: 4, A: 252, B: 0, C: 0, D: 0, S: 252 },
      memo: '竜舞からの全抜きエース。',
    } as BuildCreateRequest,
    pokemonInfo: {
      id: 1,
      name: 'カイリュー',
      image_url: '',
      abilities: ['マルチスケイル'],
      moves: [],
      base_stats: { hp: 91, attack: 134, defense: 95, sp_attack: 100, sp_defense: 100, speed: 80 },
    } as unknown as PokemonInfo,
  },
];

export const TrainedList = () => {
  const [party, setParty] = useState<PartyMemberEntry[]>(initialParty);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
  const [editingPokemon, setEditingPokemon] = useState<Partial<PartyMemberEntry> | null>(null);

  const handleEdit = (entryId: string) => {
    alert('編集機能は開発中です。対象ID: ' + entryId);
  };

  const handleDelete = (entryId: string) => {
    if (window.confirm('このポケモンをパーティから削除しますか？')) {
      setParty(party.filter(p => p.entryId !== entryId));
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

  // 変更点: IDを元にAPIからパーティ情報を取得し、Stateを上書きするように変更
  const handleLoadParty = (loadedParty: PartyResponse) => {
    if (party.length > 0) {
      if (!window.confirm('現在のパーティは上書きされます。よろしいですか？')) {
        return;
      }
    }

    try {
      if (loadedParty.members) {
        // TODO: PartyResponse.members (BuildCreateRequest[] 相当) を
        // PartyMemberEntry[] (entryId / pokemonInfo付き) に変換する処理を実装する
        // setParty(loadedParty.members.map(m => ({ entryId: crypto.randomUUID(), pokemon: m })));
      } else {
        setParty([]);
      }

      // モーダルを閉じる
      setIsPartyModalOpen(false);

    } catch (error) {
      console.error('パーティ読み込みエラー:', error);
      alert('パーティの読み込みに失敗しました。');
    }
  };

  const handleSearchSuccess = (data: PokemonInfo) => {
    const newPokemon: Partial<BuildCreateRequest> = {
      pokemon_id: data.id,
      pokemon_name: data.name || '不明',
      nickname: '',
      item: '',
      ability: data.abilities?.[0] || '',
      tera_type: 'ノーマル',
      moves: ['', '', '', ''],
      evs: { H: 0, A: 0, B: 0, C: 0, D: 0, S: 0 },
      memo: '',
    };

    setEditingPokemon({
      entryId: crypto.randomUUID(),
      pokemon: newPokemon as BuildCreateRequest,
      pokemonInfo: data,
    });
  };

  const handleSavePokemon = (entry: PartyMemberEntry) => {
    setParty(prev => {
      const exists = prev.find(p => p.entryId === entry.entryId);
      if (exists) {
        return prev.map(p => p.entryId === entry.entryId ? entry : p);
      }
      return [...prev, entry];
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
            現在 {party.length} / 6 匹
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
        </div>
      </header>

      <div className="flex flex-col gap-6">
        {party.map(entry => (
          <PartyMemberCard
            key={entry.entryId}
            pokemon={entry.pokemon}
            pokemonInfo={entry.pokemonInfo}
            onEdit={() => handleEdit(entry.entryId)}
            onDelete={() => handleDelete(entry.entryId)}
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