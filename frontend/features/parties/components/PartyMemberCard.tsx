// frontend/features/parties/components/PartyMemberCard.tsx
import React from 'react';
import { Edit2, Trash2, Diamond, Zap, Package, Activity, MessageSquare, Swords } from 'lucide-react';
import { TrainedPokemon } from '@/features/bulids/types/mock';

interface PartyMemberCardProps {
  pokemon: TrainedPokemon;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const PartyMemberCard: React.FC<PartyMemberCardProps> = ({ pokemon, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
      {/* 1. ヘッダー部分 */}
      <div className="bg-slate-800 p-6 text-white flex flex-col md:flex-row items-center gap-6 relative">
        <div className="absolute top-4 right-4 flex gap-2">
          {onEdit && (
            <button type="button" onClick={onEdit} className="p-2 bg-slate-700/50 hover:bg-blue-500 rounded-full transition-colors backdrop-blur-sm" title="編集">
              <Edit2 size={16} className="text-white" />
            </button>
          )}
          {onDelete && (
            <button type="button" onClick={onDelete} className="p-2 bg-slate-700/50 hover:bg-red-500 rounded-full transition-colors backdrop-blur-sm" title="削除">
              <Trash2 size={16} className="text-white" />
            </button>
          )}
        </div>

        <div className="bg-white p-2 rounded-full shadow-inner flex-shrink-0">
          {pokemon.imageUrl ? (
            <img src={pokemon.imageUrl} alt={pokemon.species} className="w-24 h-24 md:w-28 md:h-28 object-contain" />
          ) : (
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold">No Image</div>
          )}
        </div>
        
        <div className="text-center md:text-left w-full md:w-auto">
          <h2 className="text-3xl md:text-4xl font-black">{pokemon.nickname || pokemon.species || '未設定'}</h2>
          {pokemon.nickname && <p className="text-slate-300 opacity-80 tracking-widest mt-1">{pokemon.species}</p>}
        </div>
      </div>

      {/* 2. 詳細スペック */}
      <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 左カラム：基本構成 */}
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
              <Package size={16} /> バトル構成 (Build)
            </h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">持ち物</label>
                <div className="px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 font-medium text-gray-700">{pokemon.item || '未設定'}</div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><Zap size={12} className="text-yellow-500"/> 特性</label>
                <div className="px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 font-medium text-gray-700">{pokemon.ability || '未設定'}</div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><Diamond size={12} className="text-cyan-500"/> テラスタイプ</label>
                <div className="px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 font-bold text-gray-800">{pokemon.teraType || '未設定'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 右カラム：簡易ステータス表示 */}
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
            <Activity size={16} /> 努力値・実数値 (EVs / Actual)
          </h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 grid grid-cols-2 gap-2 text-sm">
            {['HP', 'attack', 'defense', 'sp_attack', 'sp_defense', 'speed'].map(stat => {
              const statLabels: Record<string, string> = { HP: 'H', attack: 'A', defense: 'B', sp_attack: 'C', sp_defense: 'D', speed: 'S' };
              const label = statLabels[stat];
              const ev = pokemon.evs[stat as keyof typeof pokemon.evs];
              const actual = pokemon.actualStats[stat as keyof typeof pokemon.actualStats];
              
              return (
                <div key={stat} className="flex justify-between items-center border-b border-gray-200 pb-1 last:border-0">
                  <span className="font-bold text-gray-600">{label}</span>
                  <div className="text-right">
                    <span className="text-gray-800 font-bold mr-2">{actual}</span>
                    <span className="text-xs text-gray-400">({ev})</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. 技構成 ＆ メモ */}
      <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-200 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
            <Swords size={16} className="text-red-400" /> 技構成 (Moves)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pokemon.moves.map((move, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm font-medium text-gray-800 flex items-center shadow-sm">
                <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs mr-3 font-bold flex-shrink-0">{idx + 1}</span>
                <span className="truncate">{move || <span className="text-gray-400 italic">未設定</span>}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
            <MessageSquare size={16} className="text-blue-400" /> 育成メモ (Notes)
          </h3>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-700 flex-1 min-h-[6rem] shadow-sm">
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