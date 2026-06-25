import React, { useState } from 'react';
import { PokemonStatusEditor, PokemonStatusState } from '../../components/pokemonBuildingForm';

interface SidebarPartyMember extends PokemonStatusState {
  id: string;
  role?: string;
}

export const RightSidebar: React.FC = () => {
  // 6スロット分の初期データ (努力値を MAX 32 前提に調整)
  const [partyMembers, setPartyMembers] = useState<SidebarPartyMember[]>([
    {
      id: 'build-001', name: 'ガブリアス', level: 50, nature: 'ようき (S↑ C↓)',
      baseStats: { hp: 108, atk: 130, def: 95, spa: 80, spd: 85, spe: 102 },
      individualValues: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
      effortValues: { hp: 0, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 }, // ★ MAX 32
      role: '物理アタッカー'
    },
    {
      id: 'build-002', name: 'ムクホーク', level: 50, nature: 'ようき (S↑ C↓)',
      baseStats: { hp: 85, atk: 120, def: 70, spa: 50, spd: 60, spe: 100 },
      individualValues: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
      effortValues: { hp: 0, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 },
      role: 'じそく枠'
    },
    {
      id: 'build-003', name: 'イダイトウ', level: 50, nature: 'いじっぱり (A↑ C↓)',
      baseStats: { hp: 120, atk: 112, def: 65, spa: 80, spd: 75, spe: 78 },
      individualValues: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
      effortValues: { hp: 0, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 },
      role: 'スイーパー'
    },
    {
      id: 'build-004', name: '未設定', level: 50, nature: 'てれや (補正なし)',
      baseStats: { hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 100 },
      individualValues: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
      effortValues: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
      role: '-'
    },
    {
      id: 'build-005', name: '未設定', level: 50, nature: 'てれや (補正なし)',
      baseStats: { hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 100 },
      individualValues: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
      effortValues: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
      role: '-'
    },
    {
      id: 'build-006', name: '未設定', level: 50, nature: 'てれや (補正なし)',
      baseStats: { hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 100 },
      individualValues: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
      effortValues: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
      role: '-'
    },
  ]);

  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const handlePokemonChange = (updatedData: PokemonStatusState) => {
    const newParty = [...partyMembers];
    newParty[selectedIndex] = {
      ...newParty[selectedIndex],
      ...updatedData,
    };
    setPartyMembers(newParty);
  };

  const currentPokemon = partyMembers[selectedIndex];

  return (
    <aside className="w-full lg:w-[600px] bg-slate-900/70 lg:border-l border-slate-800 flex flex-col max-h-screen overflow-y-auto">
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-sm font-extrabold tracking-wide text-slate-400 uppercase flex items-center gap-1.5 mb-3">
          現在のパーティメンバー
        </h2>
        
        {/* 6つのスロット（個体値などを非表示にし、名前とロールのみですっきり表示） */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {partyMembers.map((member, index) => {
            const isSelected = index === selectedIndex;
            return (
              <button
                key={member.id}
                onClick={() => setSelectedIndex(index)}
                className={`h-16 border rounded-lg p-3 flex flex-col justify-center text-left transition-colors group ${
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
                  {member.role && member.role !== '-' && (
                    <span className="text-[9px] bg-slate-800/80 px-1.5 py-0.5 rounded text-slate-400 font-medium">
                      {member.role}
                    </span>
                  )}
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
          <PokemonStatusEditor 
            data={currentPokemon} 
            onChange={handlePokemonChange} 
          />
        </div>
      </div>
    </aside>
  );
};