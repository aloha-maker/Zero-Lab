// frontend/features/bulids/components/BuildFormCard.tsx
import React from 'react';
import { Edit2, Trash2, Diamond, Zap, Package, Activity, MessageSquare, Swords } from 'lucide-react';
import { TrainedPokemon } from '../../bulids/types/mock';
// ↓ PokemonInfo の定義場所に合わせてパスを調整してください
import StatForm from "@/features/stat-calculator/components/StatForm";
import { PokemonInfo } from '@/features/pokedex/types'; 

// ステータス行のコンポーネント
const StatRow = ({ 
  label, base, ev, actual, isEditable, onEvChange 
}: { 
  label: string, base: number, ev: number, actual: number, 
  isEditable?: boolean, onEvChange?: (val: number) => void
}) => (
  <tr className="border-b border-gray-100 last:border-0 hover:bg-white transition-colors">
    <td className="py-2 px-2 font-black text-gray-600 uppercase text-center w-12">{label}</td>
    <td className="py-2 px-2 text-center text-gray-500 font-medium">{base || '-'}</td>
    <td className="py-2 px-2 text-center">
      {isEditable ? (
        <input 
          type="number" 
          min="0" 
          max="252" 
          value={ev || ''} 
          onChange={(e) => onEvChange && onEvChange(Number(e.target.value))}
          placeholder="0"
          className="w-16 text-center border border-gray-300 rounded-md px-2 py-1 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white shadow-sm"
        />
      ) : (
        <span className={`inline-block px-2 py-0.5 rounded text-sm ${ev >= 252 ? 'bg-orange-100 text-orange-700 font-bold shadow-sm' : ev > 0 ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-400'}`}>
          {ev}
        </span>
      )}
    </td>
    <td className="py-2 px-2 text-center font-bold text-gray-800 text-base">{actual || '-'}</td>
  </tr>
);

interface PokemonCardProps {
  pokemon: TrainedPokemon;
  pokemonInfo?: PokemonInfo;
  onChange?: (updatedPokemon: TrainedPokemon) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const PokemonCard: React.FC<PokemonCardProps> = ({ 
  pokemon, pokemonInfo, onChange, onEdit, onDelete 
}) => {
  const isEditable = !!onChange;

  const handleChange = (field: keyof TrainedPokemon, value: string) => {
    if (onChange) onChange({ ...pokemon, [field]: value });
  };

  const handleEvChange = (stat: string, value: number) => {
    if (onChange) {
      onChange({ 
        ...pokemon, 
        evs: { ...pokemon.evs, [stat]: value } as TrainedPokemon['evs'] 
      });
    }
  };

  const handleMoveChange = (index: number, value: string) => {
    if (onChange) {
      const newMoves = [...pokemon.moves];
      while (newMoves.length < 4) newMoves.push('');
      newMoves[index] = value;
      onChange({ ...pokemon, moves: newMoves });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
      
      {/* 1. ヘッダー部分 */}
      <div className="bg-slate-800 p-6 text-white flex flex-col md:flex-row items-center gap-6 relative">
        <div className="absolute top-4 right-4 flex gap-2">
          {onEdit && (
            <button onClick={onEdit} className="p-2 bg-slate-700/50 hover:bg-blue-500 rounded-full transition-colors backdrop-blur-sm" title="編集">
              <Edit2 size={16} className="text-white" />
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} className="p-2 bg-slate-700/50 hover:bg-red-500 rounded-full transition-colors backdrop-blur-sm" title="削除">
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
          {isEditable ? (
            <div className="space-y-2">
              <input 
                type="text" 
                value={pokemon.nickname || ''} 
                onChange={e => handleChange('nickname', e.target.value)}
                placeholder="ニックネーム (任意)"
                className="bg-slate-700/50 text-white placeholder-slate-400 px-3 py-1.5 rounded-lg border border-slate-600 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none w-full md:w-64 text-2xl font-black"
              />
              <div className="text-slate-300 opacity-80 text-sm tracking-widest">{pokemon.species}</div>
            </div>
          ) : (
            <>
              <h2 className="text-3xl md:text-4xl font-black">{pokemon.nickname || pokemon.species || '未設定'}</h2>
              {pokemon.nickname && <p className="text-slate-300 opacity-80 tracking-widest mt-1">{pokemon.species}</p>}
            </>
          )}
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
                {isEditable ? (
                  <input type="text" value={pokemon.item || ''} onChange={e => handleChange('item', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="きあいのタスキ など" />
                ) : (
                  <div className="px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 font-medium text-gray-700">{pokemon.item || '未設定'}</div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><Zap size={12} className="text-yellow-500"/> 特性</label>
                {isEditable ? (
                  pokemonInfo && pokemonInfo.abilities.length > 0 ? (
                    <select
                      value={pokemon.ability || ''}
                      onChange={e => handleChange('ability', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                    >
                      <option value="">選択してください</option>
                      {pokemonInfo.abilities.map(ability => (
                        <option key={ability} value={ability}>{ability}</option>
                      ))}
                    </select>
                  ) : (
                    // マスターデータがない場合のフォールバック
                    <input type="text" value={pokemon.ability || ''} onChange={e => handleChange('ability', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="特性" />
                  )
                ) : (
                  <div className="px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 font-medium text-gray-700">{pokemon.ability || '未設定'}</div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><Diamond size={12} className="text-cyan-500"/> テラスタイプ</label>
                {isEditable ? (
                  <input type="text" value={pokemon.teraType || ''} onChange={e => handleChange('teraType', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-700 font-bold focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="ノーマル など" />
                ) : (
                  <div className="px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 font-bold text-gray-800">{pokemon.teraType || '未設定'}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 右カラム：ステータス */}
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
            <Activity size={16} /> ステータス (Stats)
          </h3>
          <StatForm
              pokemon={pokemonInfo}
              /* 必要なprops */
          />
        </div>
      </div>

      {/* 3. 技構成 ＆ メモ */}
      <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-200 grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
            <Swords size={16} className="text-red-400" /> 技構成 (Moves)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, idx) => {
              const move = pokemon.moves[idx] || '';
              return (
                <div key={idx} className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm font-medium text-gray-800 flex items-center shadow-sm transition-shadow hover:shadow-md">
                  <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs mr-3 font-bold flex-shrink-0">{idx + 1}</span>
                  {isEditable ? (
                    // ★ 技をリストボックスに変更
                    pokemonInfo && pokemonInfo.moves.length > 0 ? (
                      <select
                        value={move}
                        onChange={e => handleMoveChange(idx, e.target.value)}
                        className="w-full bg-transparent outline-none border-b border-gray-200 focus:border-indigo-500 transition-colors py-1 cursor-pointer truncate"
                      >
                        <option value="">技を選択...</option>
                        {pokemonInfo.moves.map(m => (
                          <option key={m.name} value={m.name}>{m.name}</option>
                        ))}
                      </select>
                    ) : (
                      <input 
                        type="text" 
                        value={move} 
                        onChange={e => handleMoveChange(idx, e.target.value)} 
                        placeholder="技名"
                        className="w-full bg-transparent outline-none border-b border-gray-200 focus:border-indigo-500 transition-colors py-1"
                      />
                    )
                  ) : (
                    <span className="truncate">{move || <span className="text-gray-400 italic">未設定</span>}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col">
          <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
            <MessageSquare size={16} className="text-blue-400" /> 育成メモ (Notes)
          </h3>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-700 flex-1 min-h-[6rem] shadow-sm">
            {isEditable ? (
              <textarea 
                value={pokemon.notes || ''} 
                onChange={e => handleChange('notes', e.target.value)}
                placeholder="役割、ダメージ計算、選出パターンなどを入力..."
                className="w-full h-full min-h-[6rem] bg-transparent outline-none resize-y"
              />
            ) : pokemon.notes ? (
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