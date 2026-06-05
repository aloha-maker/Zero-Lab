// frontend/app/battle/components/PokemonIcon.tsx
'use client';

import { useBattleStore } from '../store/useBattleStore';
import { OpponentPokemon } from '../types';

interface Props {
  pokemon: OpponentPokemon;
}

export function PokemonIcon({ pokemon }: Props) {
  const toggleSelected = useBattleStore((state) => state.toggleSelected);
  const toggleFainted = useBattleStore((state) => state.toggleFainted);
  const setEditingSlot = useBattleStore((state) => state.setEditingSlot); // 🌟 追加

  return (
    <div 
      className={`
        relative p-3 rounded-xl cursor-pointer transition-all border-2
        ${pokemon.is_selected ? 'border-blue-500 bg-blue-900/30' : 'border-gray-700 bg-gray-800'}
        ${pokemon.is_fainted ? 'opacity-40 grayscale' : 'opacity-100'}
      `}
      onClick={() => toggleSelected(pokemon.slot_order)}
      onDoubleClick={() => toggleFainted(pokemon.slot_order)}
    >
      <div className="flex justify-between items-start">
        <span className="text-xs text-gray-400 font-bold">枠 {pokemon.slot_order}</span>
        
        {/* 🌟 詳細メモを開くボタン */}
        <button 
          onClick={(e) => {
            e.stopPropagation(); // 親のonClick(選出)が発火するのを防ぐ
            setEditingSlot(pokemon.slot_order);
          }}
          className="bg-gray-700 hover:bg-gray-600 p-1 rounded text-xs"
        >
          📝 メモ
        </button>
      </div>

      <p className="text-center font-bold mt-2 text-lg">
        {/* 本来はここにマスターデータから取得した名前を表示します */}
        ID: {pokemon.base_pokemon_id}
      </p>

      {/* テラスタル済みマーク */}
      {pokemon.is_tera_used && (
        <span className="absolute -top-2 -right-2 text-2xl drop-shadow-md">💎</span>
      )}
    </div>
  );
}