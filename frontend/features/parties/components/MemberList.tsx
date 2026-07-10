// frontend/features/parties/components/memberList.tsx
'use client';

import React, { useState } from 'react';
import { BuildCreateRequest } from '@/features/bulids/types';
import { PokemonInfo } from '../../pokedex/types';
import { PartyResponse } from '@/features/parties/types';

import { PartyMemberCard } from './PartyMemberCard';
import { AddPokemonModal } from '../../bulids/components/AddPokemonModal';
import { LoadPartyModal } from './LoadPartyModal';
import { StatFormModal } from './StatFormModal';
import { searchPokemon } from '@/features/pokedex/api/searchPokemon'; 
import type { PokemonBuildResponse } from '@/features/bulids/types';

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

  // ==========================================
  // ★ 変更点: editingPokemon の状態管理をシンプルにする
  // ==========================================
  // モーダルを表示するかどうかのフラグ
  const [isStatModalOpen, setIsStatModalOpen] = useState(false);
  // 新規追加用のマスタデータ
  const [activePokemonInfo, setActivePokemonInfo] = useState<PokemonInfo | undefined>(undefined);
  // 編集用の育成論ID（もし既存のデータを編集する機能があるなら使う）
  const [activeBuildId, setActiveBuildId] = useState<string | undefined>(undefined);
  // どの枠を編集しているかのID
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  const handleEdit = (entryId: string) => {
    // 「ポケモンを追加する」と同様にAddPokemonModalを開くが、
    // 検索結果を戻す先として編集中のentryIdを保持しておく
    setEditingEntryId(entryId);
    setIsAddModalOpen(true);
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
    setEditingEntryId(null);
    setIsAddModalOpen(true);
  };

  // ==========================================
  // AddPokemonModal 内のサジェストから選択された時の処理
  // ==========================================
  const handleSavedBuildSelect = async (selectedBuild: PokemonBuildResponse) => {
    try {
      // 画面（カード）に画像や種族値を表示するため、マスタデータを取得する
      const info = await searchPokemon(selectedBuild.pokemon_name);

      const safePokemonData = {
        ...selectedBuild,
        evs: selectedBuild.evs || { H: 0, A: 0, B: 0, C: 0, D: 0, S: 0 },
        ivs: selectedBuild.ivs || { H: 31, A: 31, B: 31, C: 31, D: 31, S: 31 },
        moves: selectedBuild.moves || ["", "", "", ""],
      };

      const newEntry: PartyMemberEntry = {
        entryId: crypto.randomUUID(),
        pokemon: safePokemonData as any, // 安全になったデータを渡す
        pokemonInfo: info,
      };

      setParty(prev => [...prev, newEntry]);

    } catch (error) {
      console.error('ポケモン情報の取得に失敗しました', error);
      alert('ポケモンの追加に失敗しました。');
    }
  };

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
    setActivePokemonInfo(data); // 検索結果のマスタデータをセット
    setActiveBuildId(undefined); // 新規なのでIDはなし
    setIsStatModalOpen(true);    // 育成フォームモーダルを開く
  };

  // ==========================================
  // ★ 変更点: 保存成功時の処理（PokemonCardの onSuccess から呼ばれる）
  // ※ 今回のPokemonCardはAPIに直接保存してしまうため、PartyのStateをどう更新するかが課題になります。
  // ※ 一旦は「保存成功＝モーダルを閉じる」のみとし、パーティへの追加ロジックは別途APIから再取得するなどの設計が必要です。
  // ==========================================
  const handleStatModalSuccess = (savedData: any) => {
    
    const newEntry: PartyMemberEntry = {
      entryId: crypto.randomUUID(), // フロントエンド用の適当なID
      pokemon: savedData as BuildCreateRequest, // 入力した育成データ
      pokemonInfo: activePokemonInfo, // 検索時にキープしておいたマスタデータ（画像や種族値）
    };

    setParty(prev => [...prev, newEntry]);
    
    // モーダルを閉じて状態をリセット
    setIsStatModalOpen(false);
    setActivePokemonInfo(undefined);
    setActiveBuildId(undefined);
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
        onSavedSelect={handleSavedBuildSelect}
      />

      <LoadPartyModal
        isOpen={isPartyModalOpen}
        onClose={() => setIsPartyModalOpen(false)}
        onLoadParty={handleLoadParty}
      />

      <StatFormModal
        isOpen={isStatModalOpen}
        onClose={() => {
          setIsStatModalOpen(false);
          setActivePokemonInfo(undefined);
          setActiveBuildId(undefined);
        }}
        buildId={activeBuildId}          // 編集用ID
        pokemonInfo={activePokemonInfo}  // 新規作成用マスタデータ
        onSuccess={handleStatModalSuccess} // 保存成功時のコールバック
      />
    </div>
  );
};