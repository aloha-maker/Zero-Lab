// frontend/features/parties/components/PartyMemberCard.tsx
import React, { useEffect, useRef } from 'react';
import { Edit2, Trash2, Diamond, Zap, Package, MessageSquare, Swords, Loader2 } from 'lucide-react';
import { BuildCreateRequest } from '@/features/bulids/types';
import { PokemonInfo } from '@/features/pokedex/types';
import { usePokemonStats } from '@/features/stat-calculator/hooks/usePokemonStats';
import { NATURES } from '@/features/stat-calculator/types';

interface PartyMemberCardProps {
  pokemon: BuildCreateRequest;
  pokemonInfo?: PokemonInfo;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const PartyMemberCard: React.FC<PartyMemberCardProps> = ({ pokemon, pokemonInfo, onEdit, onDelete }) => {
  // 1. usePokemonStatsフックの呼び出し
  const {
    results,
    setNatureIndex,
    handleStatChange,
    handleCalculate,
    isLoading,
  } = usePokemonStats({
    initialPokemon: pokemonInfo,
    initialPokemonName: pokemon.pokemon_name
  });

  const hasCalculated = useRef(false);

  // 2. Propsから受け取ったデータをフックの内部ステートに同期し、計算を実行
  useEffect(() => {
    if (!pokemonInfo) return;

    // 性格の同期
    const nIdx = NATURES.findIndex(n => n.name === pokemon.nature);
    if (nIdx !== -1) {
      setNatureIndex(nIdx);
    }

    // 努力値の同期
    handleStatChange('hp', 'ev', pokemon.evs.H);
    handleStatChange('attack', 'ev', pokemon.evs.A);
    handleStatChange('defense', 'ev', pokemon.evs.B);
    handleStatChange('sp_attack', 'ev', pokemon.evs.C);
    handleStatChange('sp_defense', 'ev', pokemon.evs.D);
    handleStatChange('speed', 'ev', pokemon.evs.S);

    // Reactのステート更新（バッチ処理）の完了を待ってから計算を発火させる
    const timer = setTimeout(() => {
      handleCalculate();
      hasCalculated.current = true;
    }, 50);

    return () => clearTimeout(timer);
  }, [pokemon, pokemonInfo, setNatureIndex, handleStatChange, handleCalculate]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
      {/* 1. ヘッダー部分 */}
      <div className="bg-slate-800 px-4 py-2.5 text-white flex items-center gap-3">
        <div className="bg-white p-1 rounded-full flex-shrink-0">
          {pokemonInfo?.image_url ? (
            <img src={pokemonInfo.image_url} alt={pokemon.pokemon_name} className="w-10 h-10 object-contain" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-[10px] font-bold">No Img</div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 truncate">
            <h2 className="text-lg font-bold truncate">{pokemon.nickname || pokemon.pokemon_name || '未設定'}</h2>
            {pokemon.nickname && <span className="text-xs text-slate-300 truncate">{pokemon.pokemon_name}</span>}
          </div>
        </div>

        <div className="flex gap-1 flex-shrink-0">
          {onEdit && (
            <button type="button" onClick={onEdit} className="p-1.5 hover:bg-blue-500 rounded transition-colors" title="編集">
              <Edit2 size={14} className="text-white" />
            </button>
          )}
          {onDelete && (
            <button type="button" onClick={onDelete} className="p-1.5 hover:bg-red-500 rounded transition-colors" title="削除">
              <Trash2 size={14} className="text-white" />
            </button>
          )}
        </div>
      </div>

      {/* 2. ボディ部分（1カラムで縦に配置） */}
      <div className="p-3 space-y-3 flex-1 flex flex-col">
        
        {/* ステータス (usePokemonStatsのresultsから取得) */}
        <div className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded p-2 text-xs relative">
          {isLoading && !hasCalculated.current && (
            <div className="absolute inset-0 bg-gray-50/80 flex items-center justify-center rounded backdrop-blur-[1px]">
              <Loader2 size={16} className="animate-spin text-gray-400" />
            </div>
          )}
          {(['H', 'A', 'B', 'C', 'D', 'S'] as const).map(statKey => {
            const actualKeyMap = { H: 'hp', A: 'attack', B: 'defense', C: 'sp_attack', D: 'sp_defense', S: 'speed' } as const;
            const ev = pokemon.evs[statKey];
            const actual = results[actualKeyMap[statKey]] ?? 0;
            
            return (
              <div key={statKey} className="flex flex-col items-center flex-1">
                <span className="font-bold text-gray-400 text-[10px]">{statKey}</span>
                <span className="font-bold text-gray-800 leading-tight">{actual > 0 ? actual : '-'}</span>
                <span className="text-[10px] text-gray-500">{ev}</span>
              </div>
            );
          })}
        </div>

        {/* 基本構成 */}
        <div className="flex gap-2 text-xs">
          <div className="flex-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded flex items-center gap-1.5 truncate" title="持ち物">
            <Package size={14} className="text-gray-500 flex-shrink-0" />
            <span className="truncate font-medium">{pokemon.item || '-'}</span>
          </div>
          <div className="flex-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded flex items-center gap-1.5 truncate" title="特性">
            <Zap size={14} className="text-yellow-500 flex-shrink-0" />
            <span className="truncate font-medium">{pokemon.ability || '-'}</span>
          </div>
          <div className="flex-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded flex items-center gap-1.5 truncate" title="テラスタイプ">
            <Diamond size={14} className="text-cyan-500 flex-shrink-0" />
            <span className="truncate font-bold">{pokemon.tera_type || '-'}</span>
          </div>
        </div>

        {/* 技 */}
        <div className="grid grid-cols-2 gap-1.5">
          {Array.from({ length: 4 }).map((_, idx) => {
            const move = pokemon.moves[idx];
            return (
              <div key={idx} className="bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs font-medium text-gray-800 flex items-center gap-1.5">
                <Swords size={12} className="text-red-400 flex-shrink-0" />
                <span className="truncate">{move || <span className="text-gray-400">未設定</span>}</span>
              </div>
            );
          })}
        </div>

        {/* メモ (存在する場合のみ表示) */}
        {pokemon.memo && (
          <div className="bg-gray-50 border border-gray-200 rounded p-2 text-xs text-gray-600 mt-auto" title={pokemon.memo}>
             <div className="flex items-center gap-1 text-gray-400 mb-1">
               <MessageSquare size={12} />
             </div>
             <p className="line-clamp-3 leading-snug whitespace-pre-wrap">{pokemon.memo}</p>
          </div>
        )}

      </div>
    </div>
  );
};