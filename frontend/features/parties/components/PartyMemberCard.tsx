// frontend/features/parties/components/PartyMemberCard.tsx
import React, { useMemo } from 'react';
import { Edit2, Trash2, Diamond, Zap, Package, Activity, MessageSquare, Swords } from 'lucide-react';
import { BuildCreateRequest } from '@/features/bulids/types';
import { PokemonInfo } from '@/features/pokedex/types';

interface PartyMemberCardProps {
  pokemon: BuildCreateRequest;
  pokemonInfo?: PokemonInfo; // 画像・種族値などマスタデータ。BuildFormCardと同様に外部から渡す
  onEdit?: () => void;
  onDelete?: () => void;
}

// ------------------------------------------------------------------
// 実数値計算ロジック
// NOTE: PokemonInfo に種族値(base_stats)が
//   { hp, attack, defense, sp_attack, sp_defense, speed } の形で
//   含まれている想定で実装しています。実際のプロパティ名が異なる場合は
//   ここを実際の型に合わせて修正してください。
// NOTE: 個体値は全て31、レベル50固定という競技シーン標準の前提で計算しています。
// ------------------------------------------------------------------
const LEVEL = 50;
const IV = 31;

type StatKey = 'attack' | 'defense' | 'sp_attack' | 'sp_defense' | 'speed';

// 性格ごとの上昇/下降ステータス（日本語の性格名がBuildCreateRequestに
// 入っている想定。該当しない性格はニュートラル扱いになります）
const NATURE_MODIFIERS: Record<string, { up?: StatKey; down?: StatKey }> = {
  いじっぱり: { up: 'attack', down: 'sp_attack' },
  ようき: { up: 'speed', down: 'sp_attack' },
  おくびょう: { up: 'speed', down: 'attack' },
  ひかえめ: { up: 'sp_attack', down: 'attack' },
  ずぶとい: { up: 'defense', down: 'sp_attack' },
  わんぱく: { up: 'defense', down: 'sp_attack' },
  しんちょう: { up: 'sp_defense', down: 'sp_attack' },
  おだやか: { up: 'sp_defense', down: 'attack' },
  ゆうかん: { up: 'attack', down: 'speed' },
  れいせい: { up: 'sp_attack', down: 'speed' },
};

const getNatureMultiplier = (nature: string | undefined, stat: StatKey): number => {
  if (!nature) return 1;
  const mod = NATURE_MODIFIERS[nature];
  if (!mod) return 1;
  if (mod.up === stat) return 1.1;
  if (mod.down === stat) return 0.9;
  return 1;
};

const calcHpStat = (base: number, ev: number): number => {
  return Math.floor(((base * 2 + IV + Math.floor(ev / 4)) * LEVEL) / 100) + LEVEL + 10;
};

const calcOtherStat = (base: number, ev: number, multiplier: number): number => {
  return Math.floor(
    (Math.floor(((base * 2 + IV + Math.floor(ev / 4)) * LEVEL) / 100) + 5) * multiplier
  );
};

export const PartyMemberCard: React.FC<PartyMemberCardProps> = ({ pokemon, pokemonInfo, onEdit, onDelete }) => {
  const actualStats = useMemo(() => {
    const baseStats = pokemonInfo?.base_stats;
    if (!baseStats) return null;

    return {
      HP: calcHpStat(baseStats.hp, pokemon.evs.H),
      attack: calcOtherStat(baseStats.attack, pokemon.evs.A, getNatureMultiplier(pokemon.nature, 'attack')),
      defense: calcOtherStat(baseStats.defense, pokemon.evs.B, getNatureMultiplier(pokemon.nature, 'defense')),
      sp_attack: calcOtherStat(baseStats.sp_attack, pokemon.evs.C, getNatureMultiplier(pokemon.nature, 'sp_attack')),
      sp_defense: calcOtherStat(baseStats.sp_defense, pokemon.evs.D, getNatureMultiplier(pokemon.nature, 'sp_defense')),
      speed: calcOtherStat(baseStats.speed, pokemon.evs.S, getNatureMultiplier(pokemon.nature, 'speed')),
    };
  }, [pokemonInfo, pokemon.evs, pokemon.nature]);

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
          {pokemonInfo?.image_url ? (
            <img src={pokemonInfo.image_url} alt={pokemon.pokemon_name} className="w-24 h-24 md:w-28 md:h-28 object-contain" />
          ) : (
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold">No Image</div>
          )}
        </div>

        <div className="text-center md:text-left w-full md:w-auto">
          <h2 className="text-3xl md:text-4xl font-black">{pokemon.nickname || pokemon.pokemon_name || '未設定'}</h2>
          {pokemon.nickname && <p className="text-slate-300 opacity-80 tracking-widest mt-1">{pokemon.pokemon_name}</p>}
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
                <div className="px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 font-bold text-gray-800">{pokemon.tera_type || '未設定'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 右カラム：努力値・実数値表示 */}
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
            <Activity size={16} /> 努力値・実数値 (EVs / Actual)
          </h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 grid grid-cols-2 gap-2 text-sm">
            {(['H', 'A', 'B', 'C', 'D', 'S'] as const).map(statKey => {
              const statLabels: Record<typeof statKey, string> = { H: 'H', A: 'A', B: 'B', C: 'C', D: 'D', S: 'S' };
              const actualKeyMap = {
                H: 'HP',
                A: 'attack',
                B: 'defense',
                C: 'sp_attack',
                D: 'sp_defense',
                S: 'speed',
              } as const;
              const ev = pokemon.evs[statKey];
              const actual = actualStats ? actualStats[actualKeyMap[statKey]] : null;

              return (
                <div key={statKey} className="flex justify-between items-center border-b border-gray-200 pb-1 last:border-0">
                  <span className="font-bold text-gray-600">{statLabels[statKey]}</span>
                  <div className="text-right">
                    <span className="text-gray-800 font-bold mr-2">{actual ?? '-'}</span>
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
            {Array.from({ length: 4 }).map((_, idx) => {
              const move = pokemon.moves[idx] || '';
              return (
                <div key={idx} className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm font-medium text-gray-800 flex items-center shadow-sm">
                  <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs mr-3 font-bold flex-shrink-0">{idx + 1}</span>
                  <span className="truncate">{move || <span className="text-gray-400 italic">未設定</span>}</span>
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
            {pokemon.memo ? (
              <p className="whitespace-pre-wrap leading-relaxed">{pokemon.memo}</p>
            ) : (
              <p className="text-gray-400 italic">メモはありません</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};