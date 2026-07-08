// frontend/features/bulids/components/BuildFormCard.tsx
import React, { useCallback } from 'react';
import { Edit2, Trash2, Diamond, Zap, Package, Activity, MessageSquare, Swords } from 'lucide-react';
import { BuildCreateRequest } from '../../bulids/types/index';
import StatForm from "@/features/stat-calculator/components/StatForm";
import { PokemonInfo } from '@/features/pokedex/types'; 

interface PokemonCardProps {
  pokemon: BuildCreateRequest;
  pokemonInfo?: PokemonInfo;
  onChange?: (updated: BuildCreateRequest | ((prev: BuildCreateRequest) => BuildCreateRequest)) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSubmit?: (e: React.FormEvent) => void;
  saving?: boolean;
  errorMsg?: string | null;
  submitLabel?: string;
}

export const PokemonCard: React.FC<PokemonCardProps> = ({ 
  pokemon, pokemonInfo, onChange, onEdit, onDelete, onSubmit, saving, errorMsg, submitLabel
}) => {
  const isEditable = !!onChange;

  const handleChange = (field: keyof BuildCreateRequest, value: any) => {
    if (onChange) {
      onChange(prev => {
        // 関数型アップデートの中では、prev が引数として渡されるオブジェクトなので、
        // 確実に BuildCreateRequest にアサーションするか、そのままスプレッドします。
        const next = typeof prev === 'function' ? (prev as any)() : prev;
        return { ...next, [field]: value };
      });
    }
  };

  const handleMoveChange = (index: number, value: string) => {
    if (onChange) {
      onChange(prev => {
        const next = typeof prev === 'function' ? (prev as any)() : prev;
        const newMoves = [...next.moves];
        while (newMoves.length < 4) newMoves.push('');
        newMoves[index] = value;
        return { ...next, moves: newMoves };
      });
    }
  };

  const handleStatusUpdate = useCallback((data: any) => {
    if (onChange) {
      onChange(prev => ({
        ...prev,
        pokemon_id: data.pokemon_id || prev.pokemon_id,
        pokemon_name: data.pokemon_name || prev.pokemon_name,
        nature: data.nature || prev.nature,
        evs: {
          H: data.evs.hp,
          A: data.evs.attack,
          B: data.evs.defense,
          C: data.evs.sp_attack,
          D: data.evs.sp_defense,
          S: data.evs.speed,
        }
      }));
    }
  }, [onChange]);

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
      
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
          {pokemonInfo?.image_url ? (
            <img src={pokemonInfo.image_url} alt={pokemon.pokemon_name} className="w-24 h-24 md:w-28 md:h-28 object-contain" />
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
              <div className="text-slate-300 opacity-80 text-sm tracking-widest">{pokemon.pokemon_name}</div>
            </div>
          ) : (
            <>
              <h2 className="text-3xl md:text-4xl font-black">{pokemon.nickname || pokemon.pokemon_name || '未設定'}</h2>
              {pokemon.nickname && <p className="text-slate-300 opacity-80 tracking-widest mt-1">{pokemon.pokemon_name}</p>}
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
                  <input type="text" value={pokemon.tera_type || ''} onChange={e => handleChange('tera_type', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-700 font-bold focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="ノーマル など" />
                ) : (
                  <div className="px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 font-bold text-gray-800">{pokemon.tera_type || '未設定'}</div>
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
              initialPokemon={pokemonInfo}
              initialPokemonName={pokemon.pokemon_name}
              onStatusUpdate={handleStatusUpdate}
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
                value={pokemon.memo || ''} 
                onChange={e => handleChange('memo', e.target.value)}
                placeholder="役割、ダメージ計算、選出パターンなどを入力..."
                className="w-full h-full min-h-[6rem] bg-transparent outline-none resize-y"
              />
            ) : pokemon.memo ? (
              <p className="whitespace-pre-wrap leading-relaxed">{pokemon.memo}</p>
            ) : (
              <p className="text-gray-400 italic">メモはありません</p>
            )}
          </div>
        </div>

      </div>

      {onSubmit && (
        <div className="px-6 md:px-8 py-5 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          {errorMsg ? (
            <p className="text-red-500 text-sm font-bold">{errorMsg}</p>
          ) : (
            <div />
          )}
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-2.5 text-sm bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-bold rounded-xl hover:brightness-110 disabled:opacity-50 transition-all shadow-md flex items-center justify-center min-w-[180px]"
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {submitLabel ? `${submitLabel.replace('する', '')}中...` : "登録中..."}
              </>
            ) : (
              submitLabel || "ポケモンを登録する"
            )}
          </button>
        </div>
      )}
    </form>
  );
};