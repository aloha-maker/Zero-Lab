// frontend/features/bulids/components/BuildFormCard.tsx
import React from 'react';
import { Edit2, Trash2, Diamond, Zap, Package, Activity, MessageSquare } from 'lucide-react';
import { TrainedPokemon, StatType } from '../../bulids/types/mock';

const StatRow = ({ label, base, ev, actual, colorClass }: { label: StatType, base: number, ev: number, actual: number, colorClass: string }) => (
<tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
    <td className={`py-1 px-2 font-bold ${colorClass} text-center`}>{label}</td>
    <td className="py-1 px-2 text-center text-gray-600">{base || '-'}</td>
    <td className="py-1 px-2 text-center">
    <span className={`inline-block px-1.5 rounded-sm ${ev >= 252 ? 'bg-orange-100 text-orange-700 font-bold' : ev > 0 ? 'bg-blue-50 text-blue-600' : 'text-gray-400'}`}>
        {ev}
    </span>
    </td>
    <td className="py-1 px-2 text-center font-bold text-gray-800">{actual || '-'}</td>
</tr>
);

interface PokemonCardProps {
  pokemon: TrainedPokemon;
  onEdit: () => void;
  onDelete: () => void;
}

export const PokemonCard: React.FC<PokemonCardProps> = ({ pokemon, onEdit, onDelete }) => {
  const statColors: Record<StatType, string> = {
    H: 'text-green-600',
    A: 'text-red-500',
    B: 'text-orange-500',
    C: 'text-blue-500',
    D: 'text-yellow-600',
    S: 'text-pink-500',
  };
  const statLabels: StatType[] = ['H', 'A', 'B', 'C', 'D', 'S'];

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col xl:flex-row">
      {/* 1. 基本情報セクション */}
      <div className="p-5 flex-1 border-b xl:border-b-0 xl:border-r border-gray-100 bg-gradient-to-br from-white to-gray-50 flex flex-col sm:flex-row xl:flex-col gap-4 relative">
        <div className="absolute top-3 right-3 flex gap-2">
          <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="編集">
            <Edit2 size={16} />
          </button>
          <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" title="削除">
            <Trash2 size={16} />
          </button>
        </div>

        <div className="flex-shrink-0 flex justify-center items-center">
          <img src={pokemon.imageUrl} alt={pokemon.species} className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-sm object-cover" />
        </div>
        
        <div className="flex-1">
          <div className="mb-3 text-center sm:text-left xl:text-center mt-2 sm:mt-0 xl:mt-2">
            <h2 className="text-xl font-bold text-gray-800">{pokemon.nickname || pokemon.species}</h2>
            {pokemon.nickname && <p className="text-sm text-gray-500 font-medium">{pokemon.species}</p>}
          </div>

          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
              <Package size={14} className="text-gray-400" />
              <span className="font-medium min-w-[3rem] text-gray-500">持ち物</span>
              <span className="truncate">{pokemon.item}</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
              <Zap size={14} className="text-yellow-500" />
              <span className="font-medium min-w-[3rem] text-gray-500">特性</span>
              <span className="truncate">{pokemon.ability}</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
              <Diamond size={14} className="text-cyan-500" />
              <span className="font-medium min-w-[3rem] text-gray-500">テラス</span>
              <span className="font-bold">{pokemon.teraType}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ステータスセクション */}
      <div className="p-5 flex-1 xl:max-w-[300px] border-b xl:border-b-0 xl:border-r border-gray-100 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-3">
          <Activity size={18} className="text-indigo-500" />
          <h3 className="font-bold text-gray-700">ステータス</h3>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="py-2 px-2 text-gray-500 font-medium w-12"></th>
                <th className="py-2 px-2 text-gray-500 font-medium">種族値</th>
                <th className="py-2 px-2 text-gray-500 font-medium">努力値</th>
                <th className="py-2 px-2 text-gray-500 font-medium">実数値</th>
              </tr>
            </thead>
            <tbody>
              {statLabels.map(stat => (
                <StatRow
                  key={stat}
                  label={stat}
                  base={pokemon.baseStats[stat]}
                  ev={pokemon.evs[stat]}
                  actual={pokemon.actualStats[stat]}
                  colorClass={statColors[stat]}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. 技＆メモセクション */}
      <div className="p-5 flex-[1.5] flex flex-col gap-4">
        <div>
          <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
            <span className="inline-block w-4 h-4 rounded-full bg-red-400"></span>
            技構成
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {pokemon.moves.map((move, idx) => (
              <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-800 flex items-center shadow-sm">
                <span className="w-5 h-5 rounded-full bg-white text-gray-400 flex items-center justify-center text-xs mr-2 border border-gray-200 shadow-sm">{idx + 1}</span>
                {move || <span className="text-gray-400 italic">未設定</span>}
              </div>
            ))}
            {Array.from({ length: Math.max(0, 4 - pokemon.moves.length) }).map((_, idx) => (
              <div key={`empty-${idx}`} className="bg-gray-50 border border-dashed border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-400 flex items-center">
                 <span className="w-5 h-5 rounded-full bg-white text-gray-300 flex items-center justify-center text-xs mr-2 border border-gray-200">-</span>
                 未設定
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
            <MessageSquare size={16} className="text-blue-400" />
            育成メモ
          </h3>
          <div className="bg-yellow-50/50 border border-yellow-100 rounded-lg p-3 text-sm text-gray-700 flex-1 min-h-[4rem]">
            {pokemon.notes ? (
              <p className="whitespace-pre-wrap leading-relaxed">{pokemon.notes}</p>
            ) : (
              <p className="text-gray-400 italic">メモはありません</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};