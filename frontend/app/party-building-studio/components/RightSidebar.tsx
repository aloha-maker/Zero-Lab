import React, { useState } from 'react';
// エディタ側から元の「PokemonStatusState」型をインポートする
import { PokemonStatusEditor, PokemonStatusState } from '../../components/pokemonBuildingForm';
import { PokemonSearchBox } from '../../components/pokemonSearchBox';


// サイドバーの各スロットで管理したい、独自の拡張データ型を定義
interface SidebarPartyMember extends PokemonStatusState {
  id: string;
  role?: string;
}

// ==========================================
// MOCK DATA: 検索候補となる育成済みポケモン一覧
// ==========================================
// 本来は外部ファイルやDB、マスターデータから取得するものですが、
// エラー回避と動作確認のためにここでサンプルデータを定義します。
const MOCK_SAVED_POKEMON_LIST: PokemonStatusState[] = [
  {
    name: 'ガブリアス', level: 50, nature: 'ようき',
    baseStats: { hp: 108, atk: 130, def: 95, spa: 80, spd: 85, spe: 102 },
    effortValues: { hp: 0, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 },
  },
  {
    name: 'ハバタクカミ', level: 50, nature: 'おくびょう',
    baseStats: { hp: 55, atk: 55, def: 55, spa: 135, spd: 135, spe: 135 },
    effortValues: { hp: 4, atk: 0, def: 0, spa: 32, spd: 0, spe: 32 },
  },
  {
    name: 'サーフゴー', level: 50, nature: 'ひかえめ',
    baseStats: { hp: 87, atk: 60, def: 95, spa: 133, spd: 91, spe: 84 },
    effortValues: { hp: 32, atk: 0, def: 0, spa: 32, spd: 4, spe: 0 },
  }
];


export const RightSidebar: React.FC = () => {
  // 1. 型を SidebarPartyMember[] に指定して初期化
  const [partyMembers, setPartyMembers] = useState<SidebarPartyMember[]>([
    {
      id: 'build-001', name: 'ガブリアス', level: 50, nature: 'ようき (S↑ C↓)',
      baseStats: { hp: 108, atk: 130, def: 95, spa: 80, spd: 85, spe: 102 },
      effortValues: { hp: 0, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 },
      role: '物理アタッカー'
    },
    {
      id: 'build-002', name: 'ムクホーク', level: 50, nature: 'ようき (S↑ C↓)',
      baseStats: { hp: 85, atk: 120, def: 70, spa: 50, spd: 60, spe: 100 },
      effortValues: { hp: 0, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 },
      role: '-'
    },
    {
      id: 'build-003', name: 'イダイトウ', level: 50, nature: 'いじっぱり (A↑ C↓)',
      baseStats: { hp: 120, atk: 112, def: 65, spa: 80, spd: 75, spe: 78 },
      effortValues: { hp: 0, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 },
      role: '-'
    },
    {
      id: 'build-004', name: '未設定', level: 50, nature: 'てれや (補正なし)',
      baseStats: { hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 100 },
      effortValues: { hp: 0, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 },
      role: '-'
    },
    {
      id: 'build-005', name: '未設定', level: 50, nature: 'てれや (補正なし)',
      baseStats: { hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 100 },
      effortValues: { hp: 0, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 },
      role: '-'
    },
    {
      id: 'build-006', name: '未設定', level: 50, nature: 'てれや (補正なし)',
      baseStats: { hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 100 },
      effortValues: { hp: 0, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 },
      role: '-'
    },
  ]);

  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  // 2. 引数の型をエディタ側が求める「PokemonStatusState」に合わせる
  const handlePokemonChange = (updatedData: PokemonStatusState) => {
    const newParty = [...partyMembers];
    // 既存の id や role を維持したまま、エディタから返ってきたデータで更新する
    newParty[selectedIndex] = {
      ...newParty[selectedIndex],
      ...updatedData,
    };
    setPartyMembers(newParty);
  };

  // 3. 【追加】検索ボックスでポケモンが選択されたときの処理
  const handlePokemonSelectFromSearch = (selectedPokemon: PokemonStatusState) => {
    const newParty = [...partyMembers];
    newParty[selectedIndex] = {
      ...newParty[selectedIndex], // 現在のスロットの id と role を維持
      ...selectedPokemon,         // 検索で選んだステータスで上書き
    };
    setPartyMembers(newParty);
  };

  const currentPokemon = partyMembers[selectedIndex];

  return (
    <aside className="w-full lg:w-[620px] bg-slate-900/70 lg:border-l border-slate-800 flex flex-col max-h-screen overflow-y-auto">
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-sm font-extrabold tracking-wide text-slate-400 uppercase flex items-center gap-1.5 mb-3">
          現在のパーティメンバー
        </h2>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          {partyMembers.map((member, index) => {
            const isSelected = index === selectedIndex;
            return (
              <button
                key={member.id}
                onClick={() => setSelectedIndex(index)}
                className={`h-16 border rounded-lg p-2 flex flex-col justify-center text-left transition-colors group ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-600/10 text-slate-100'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className={`text-[10px] font-bold ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`}>
                  SLOT {index + 1}
                </div>
                <div className="flex justify-between items-center w-full mt-0.5">
                  <span className={`text-xs font-bold transition-colors ${isSelected ? 'text-indigo-300' : 'group-hover:text-amber-400'}`}>
                    {member.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <hr className="border-slate-800 my-4" />

        <div className="mt-4">
          <div className="text-xs font-bold text-indigo-400 mb-2 px-1">
            選択中: SLOT {selectedIndex + 1} のステータス編集
          </div>
          {/* 1. 検索ボックス */}
          <PokemonSearchBox 
            pokemonList={MOCK_SAVED_POKEMON_LIST} 
            onSelect={handlePokemonSelectFromSearch} 
          />
          {/* 2. メインのエディタ */}
          <PokemonStatusEditor 
            data={currentPokemon} 
            onChange={handlePokemonChange} 
          />
        </div>
      </div>
    </aside>
  );
};