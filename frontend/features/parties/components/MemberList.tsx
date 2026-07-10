// frontend/features/parties/components/memberList.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { BuildCreateRequest } from '@/features/bulids/types';
import { PokemonInfo } from '../../pokedex/types';
import { PartyResponse } from '@/features/parties/types';

import { PartyMemberCard } from './PartyMemberCard';
import { AddPokemonModal } from '../../bulids/components/AddPokemonModal';
import { LoadPartyModal } from './LoadPartyModal';
import { StatFormModal } from './StatFormModal';
import { searchPokemon } from '@/features/pokedex/api/searchPokemon'; 
import type { PokemonBuildResponse } from '@/features/bulids/types';

import { usePartyForm } from '../hooks/usePartyForm'; 

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
      // モックデータにも仮想のIDを付けておきます（API連携時の build_id 相当）
      id: 'mock-build-id-1', 
    } as any, // idを含めるため一時的にanyキャスト
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
  const [partyId, setPartyId] = useState<string | undefined>(undefined);

  const {
    name: partyName,
    setName: setPartyName,
    isSaving,
    handleSave,
    handleBuildSelect
  } = usePartyForm(
    { id: partyId, name: '新規パーティ' } as any, 
    !!partyId,
    (res) => {
      // 保存成功時に実行される処理（リダイレクトはされません）
      alert(partyId ? 'パーティを更新しました！' : 'パーティを新規保存しました！');
      
      // 新規保存時は、バックエンドから返ってきた新しいIDをセットする（次回から更新扱いにするため）
      if (!partyId && res && res.id) {
        setPartyId(res.id);
      }
    }
  );

  useEffect(() => {
    for (let i = 0; i < 6; i++) {
      // APIから取得した育成論には id が含まれていることを想定し、それを usePartyForm 側に渡します
      const buildId = (party[i]?.pokemon as any)?.id || (party[i]?.pokemon as any)?.build_id || null;
      handleBuildSelect(i, buildId as string);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [party]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
  const [isStatModalOpen, setIsStatModalOpen] = useState(false);
  const [activePokemonInfo, setActivePokemonInfo] = useState<PokemonInfo | undefined>(undefined);
  const [activeBuildId, setActiveBuildId] = useState<string | undefined>(undefined);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  const handleEdit = (entryId: string) => {
    // 1. 対象のパーティメンバーを取得
    const targetEntry = party.find(p => p.entryId === entryId);
    
    if (targetEntry) {
      setEditingEntryId(entryId);
      
      // 2. マスタデータ (pokemonInfo) をセット
      setActivePokemonInfo(targetEntry.pokemonInfo);
      
      // 3. ID (id または build_id) を取得してセット
      const buildId = (targetEntry.pokemon as any).id || (targetEntry.pokemon as any).build_id;
      setActiveBuildId(buildId || undefined);
      
      // 4. StatFormModal を開く
      setIsStatModalOpen(true);
    }
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

  const handleSavedBuildSelect = async (selectedBuild: PokemonBuildResponse) => {
    try {
      const info = await searchPokemon(selectedBuild.pokemon_name);

      const safePokemonData = {
        ...selectedBuild,
        evs: selectedBuild.evs || { H: 0, A: 0, B: 0, C: 0, D: 0, S: 0 },
        ivs: selectedBuild.ivs || { H: 31, A: 31, B: 31, C: 31, D: 31, S: 31 },
        moves: selectedBuild.moves || ["", "", "", ""],
      };

      if (editingEntryId) {
        setParty(prev =>
          prev.map(p =>
            p.entryId === editingEntryId
              ? { ...p, pokemon: safePokemonData as any, pokemonInfo: info }
              : p
          )
        );
      } else {
        const newEntry: PartyMemberEntry = {
          entryId: crypto.randomUUID(),
          pokemon: safePokemonData as any,
          pokemonInfo: info,
        };
        setParty(prev => [...prev, newEntry]);
      }

      setIsAddModalOpen(false);

    } catch (error) {
      console.error('ポケモン情報の取得に失敗しました', error);
      alert('ポケモンの追加に失敗しました。');
    }
  };

  const handleLoadParty = async (loadedParty: PartyResponse) => {
    if (party.length > 0) {
      if (!window.confirm('現在のパーティは上書きされます。よろしいですか？')) {
        return;
      }
    }

    try {
      if (loadedParty.members && loadedParty.members.length > 0) {
        const newPartyEntries = await Promise.all(
          loadedParty.members.map(async (m: any) => {
            let info = undefined;
            try {
              info = await searchPokemon(m.pokemon_name);
            } catch (e) {
              console.error("マスタ取得失敗", e);
            }

            return {
              entryId: crypto.randomUUID(),
              pokemon: {
                ...m,
                evs: m.evs || { H: 0, A: 0, B: 0, C: 0, D: 0, S: 0 },
                ivs: m.ivs || { H: 31, A: 31, B: 31, C: 31, D: 31, S: 31 },
                moves: m.moves || ["", "", "", ""],
              },
              pokemonInfo: info
            };
          })
        );

        setParty(newPartyEntries);
      } else {
        setParty([]);
      }

      setPartyName(loadedParty.name || '読み込んだパーティ');
      setPartyId(loadedParty.id || undefined);

      setIsPartyModalOpen(false);

    } catch (error) {
      console.error('パーティ読み込みエラー:', error);
      alert('パーティの読み込みに失敗しました。');
    }
  };

  const handleSearchSuccess = (data: PokemonInfo) => {
    setActivePokemonInfo(data);
    setActiveBuildId(undefined);
    setIsStatModalOpen(true);
  };

  const handleStatModalSuccess = (savedData: any) => {
    if (editingEntryId) {
      setParty(prev =>
        prev.map(p =>
          p.entryId === editingEntryId
            ? {
                ...p,
                pokemon: savedData as BuildCreateRequest,
                pokemonInfo: activePokemonInfo ?? p.pokemonInfo,
              }
            : p
        )
      );
    } else {
      const newEntry: PartyMemberEntry = {
        entryId: crypto.randomUUID(),
        pokemon: savedData as BuildCreateRequest,
        pokemonInfo: activePokemonInfo,
      };
      setParty(prev => [...prev, newEntry]);
    }

    setIsStatModalOpen(false);
    setActivePokemonInfo(undefined);
    setActiveBuildId(undefined);
    setEditingEntryId(null);
  };

  // ★ 追加: 保存ボタンクリック時の簡易バリデーションと保存処理
  const onSaveClick = () => {
    if (party.length === 0) {
      alert('パーティにポケモンがいません。');
      return;
    }
    if (!partyName.trim()) {
      alert('パーティ名を入力してください。');
      return;
    }
    // 未保存の育成論（IDが無いデータ）が含まれている場合の警告（必要に応じて）
    const hasUnsavedBuild = party.some(p => !((p.pokemon as any).id || (p.pokemon as any).build_id));
    if (hasUnsavedBuild) {
      alert('育成論としてまだ保存されていないポケモンが含まれています。\nこのまま保存すると除外される可能性があります。');
    }

    // usePartyForm の保存処理を実行
    handleSave();
  };

  return (
    <div className="flex flex-col gap-6 relative">
      <header className="flex flex-col sm:flex-row items-center justify-between mb-8 bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
        
        {/* パーティ名入力欄 */}
        <div className="w-full sm:w-1/2 flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-3xl flex-shrink-0">⚔️</span>
            <input
              type="text"
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              placeholder="パーティ名を入力"
              className="text-2xl font-black text-gray-800 tracking-tight bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-blue-500 outline-none w-full transition-colors py-1"
            />
          </div>
          <p className="text-sm text-gray-500 mt-1 pl-11">
            現在 {party.length} / 6 匹
          </p>
        </div>

        {/* ボタンエリア */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0 w-full sm:w-auto">
          <button
            onClick={() => setIsPartyModalOpen(true)}
            className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all shadow-sm bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
          >
            <span role="img" aria-label="folder">📁</span>
            パーティ読込
          </button>

          <button
            onClick={onSaveClick}
            disabled={isSaving}
            className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all shadow-sm bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 disabled:opacity-50"
          >
            <span role="img" aria-label="save">💾</span>
            {isSaving ? '処理中...' : (partyId ? 'パーティ更新' : 'パーティ保存')}
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
          setEditingEntryId(null);
        }}
        buildId={activeBuildId}
        pokemonInfo={activePokemonInfo}
        onSuccess={handleStatModalSuccess}
      />
    </div>
  );
};