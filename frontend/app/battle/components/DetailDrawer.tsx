'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import { useBattleStore } from '../store/useBattleStore';
import { OpponentPokemon } from '../types';

// ==========================================
// マスターデータの型とキャッシュ
// ==========================================
interface MasterItem {
  id: number;
  name: string;
}

interface MasterData {
  items: MasterItem[];
  abilities: MasterItem[];
  moves: MasterItem[];
}

// ドロワーを開閉するたびにフェッチが走らないよう、モジュールレベルでキャッシュを保持
let cachedMasterData: MasterData | null = null;

// ひらがな -> カタカナ 変換ユーティリティ
const hiraToKata = (str: string) => {
  return str.replace(/[\u3041-\u3096]/g, (match) =>
    String.fromCharCode(match.charCodeAt(0) + 0x60)
  );
};

// ==========================================
// 再利用可能なオートコンプリートコンポーネント
// ==========================================
interface AutocompleteProps {
  items: MasterItem[];
  placeholder: string;
  onSelect: (item: MasterItem) => void;
  disabled?: boolean;
}

function AutocompleteField({ items, placeholder, onSelect, disabled }: AutocompleteProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 検索フィルタリング
  const filtered = useMemo(() => {
    if (!query) return [];
    const normalized = hiraToKata(query);
    return items
      .filter((i) => i.name.includes(query) || i.name.includes(normalized))
      .slice(0, 10); // 上位10件
  }, [query, items]);

  // 外側タップでサジェストを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
      />
      {isOpen && filtered.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-xl max-h-40 overflow-y-auto">
          {filtered.map((item) => (
            <li
              key={item.id}
              onClick={() => {
                onSelect(item);
                setQuery('');
                setIsOpen(false);
              }}
              className="px-3 py-2 text-sm text-white hover:bg-blue-600 cursor-pointer border-b border-gray-600 last:border-none"
            >
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ==========================================
// メインコンポーネント
// ==========================================
const TERA_TYPES = [
  'ノーマル', 'ほのお', 'みず', 'でんき', 'くさ', 'こおり',
  'かくとう', 'どく', 'じめん', 'ひこう', 'エスパー', 'むし',
  'いわ', 'ゴースト', 'ドラゴン', 'あく', 'はがね', 'フェアリー'
];

interface DetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pokemon: OpponentPokemon;
  pokemonName: string;
  pokemonImage?: string;
}

export function DetailDrawer({ isOpen, onClose, pokemon, pokemonName, pokemonImage }: DetailDrawerProps) {
  const updatePokemonDetail = useBattleStore((state) => state.updatePokemonDetail);
  const toggleTera = useBattleStore((state) => state.toggleTera);
  const toggleMega = useBattleStore((state) => state.toggleMega);

  const [masterData, setMasterData] = useState<MasterData | null>(cachedMasterData);
  const [isLoading, setIsLoading] = useState(!cachedMasterData);

  // 🌟 PokeAPIから持ち物・特性・技のマスターデータを一括取得
  useEffect(() => {
    if (!isOpen || cachedMasterData) return;

    async function fetchMasterData() {
      const query = `
        query {
          items: pokemon_v2_item {
            id
            names: pokemon_v2_itemnames(where: {language_id: {_eq: 11}}) { name }
          }
          abilities: pokemon_v2_ability {
            id
            names: pokemon_v2_abilitynames(where: {language_id: {_eq: 11}}) { name }
          }
          moves: pokemon_v2_move {
            id
            names: pokemon_v2_movenames(where: {language_id: {_eq: 11}}) { name }
          }
        }
      `;

      try {
        const res = await fetch('https://beta.pokeapi.co/graphql/v1beta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        });

        const { data } = await res.json();

        // 扱いやすいように {id, name} の形に整形
        const formatData = (list: any[]) =>
          list
            .filter((item) => item.names.length > 0)
            .map((item) => ({ id: item.id, name: item.names[0].name }));

        const formattedMasterData = {
          items: formatData(data.items),
          abilities: formatData(data.abilities),
          moves: formatData(data.moves),
        };

        cachedMasterData = formattedMasterData;
        setMasterData(formattedMasterData);
      } catch (error) {
        console.error('マスターデータの取得に失敗しました', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMasterData();
  }, [isOpen]);

  if (!isOpen || !pokemon) return null;

  // IDから名前を引くためのヘルパー
  const getItemName = (id: number | null) => masterData?.items.find((i) => i.id === id)?.name || '';
  const getAbilityName = (id: number | null) => masterData?.abilities.find((i) => i.id === id)?.name || '';
  const getMoveName = (id: number) => masterData?.moves.find((i) => i.id === id)?.name || '';

  // 技の追加・削除ハンドラー
  const handleAddMove = (move: MasterItem) => {
    const currentMoves = pokemon.moves || [];
    if (currentMoves.length >= 4 || currentMoves.includes(move.id)) return;
    updatePokemonDetail(pokemon.slot_order, { moves: [...currentMoves, move.id] });
  };

  const handleRemoveMove = (moveId: number) => {
    const currentMoves = pokemon.moves || [];
    updatePokemonDetail(pokemon.slot_order, {
      moves: currentMoves.filter((id) => id !== moveId),
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 rounded-t-2xl z-50 p-5 pb-8 max-h-[85vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-full duration-200">
        
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-3">
            {pokemonImage && (
              <div className="relative w-10 h-10 bg-gray-800 rounded-full p-1 border border-gray-700">
                <Image src={pokemonImage} alt={pokemonName} fill sizes="40px" className="object-contain" unoptimized />
              </div>
            )}
            <h2 className="text-xl font-bold text-white">{pokemonName}</h2>
          </div>
          <button onClick={onClose} className="bg-gray-800 text-gray-300 px-4 py-1.5 rounded-full text-sm font-bold hover:bg-gray-700">
            完了
          </button>
        </div>

        
        {/* メガシンカ情報 */}
        <div className="flex justify-between items-center mb-3">
          <span className="font-bold text-sm text-gray-300">🧬 メガシンカ</span>
          <button
            onClick={() => {
              // 🌟 トグルと同時に特性をクリアしてユーザーに再入力を促す
              updatePokemonDetail(pokemon.slot_order, { ability_id: null });
              toggleMega(pokemon.slot_order);
            }}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${
              pokemon.is_mega_used ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'
            }`}
          >
            {pokemon.is_mega_used ? 'メガ済' : '通常'}
          </button>
        </div>

        {/* テラスタル情報 */}
        <div className="mb-6 bg-gray-800/50 p-4 rounded-xl border border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-sm text-gray-300 flex items-center gap-2">
              💎 テラスタル状態
            </span>
            <button
              onClick={() => toggleTera(pokemon.slot_order)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                pokemon.is_tera_used ? 'bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'bg-gray-700 text-gray-400'
              }`}
            >
              {pokemon.is_tera_used ? '使用済み' : '未使用'}
            </button>
          </div>
          
          <div className="grid grid-cols-6 gap-2 mt-3">
            {TERA_TYPES.map(type => (
              <button
                key={type}
                onClick={() => updatePokemonDetail(pokemon.slot_order, { tera_type: pokemon.tera_type === type ? null : type })}
                className={`text-[10px] py-2 rounded-lg border transition-all ${
                  pokemon.tera_type === type 
                    ? 'bg-amber-500 text-black border-amber-400 font-bold scale-105' 
                    : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* オートコンプリート入力群 */}
        <div className="space-y-5">
          {/* 持ち物 */}
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1.5 flex justify-between">
              <span>🎒 持ち物</span>
              {pokemon.item_id && (
                <span className="text-blue-400 cursor-pointer" onClick={() => updatePokemonDetail(pokemon.slot_order, { item_id: null })}>
                  クリア
                </span>
              )}
            </label>
            {pokemon.item_id ? (
              <div className="w-full bg-blue-900/30 border border-blue-500 rounded-lg p-2.5 text-blue-100 font-bold text-sm">
                {getItemName(pokemon.item_id)}
              </div>
            ) : (
              <AutocompleteField
                items={masterData?.items || []}
                placeholder={isLoading ? "データを読み込み中..." : "ひらがなで検索 (例: こだわり...)"}
                disabled={isLoading}
                onSelect={(item) => updatePokemonDetail(pokemon.slot_order, { item_id: item.id })}
              />
            )}
          </div>

          {/* 特性 */}
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1.5 flex justify-between">
              <span>🧬 特性</span>
              {pokemon.ability_id && (
                <span className="text-blue-400 cursor-pointer" onClick={() => updatePokemonDetail(pokemon.slot_order, { ability_id: null })}>
                  クリア
                </span>
              )}
            </label>
            {pokemon.ability_id ? (
              <div className="w-full bg-purple-900/30 border border-purple-500 rounded-lg p-2.5 text-purple-100 font-bold text-sm">
                {getAbilityName(pokemon.ability_id)}
              </div>
            ) : (
              <AutocompleteField
                items={masterData?.abilities || []}
                placeholder={isLoading ? "データを読み込み中..." : "ひらがなで検索 (例: マルチ...)"}
                disabled={isLoading}
                onSelect={(item) => updatePokemonDetail(pokemon.slot_order, { ability_id: item.id })}
              />
            )}
          </div>

          {/* 技 (最大4つ) */}
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1.5">
              ⚔️ 判明した技 <span className="text-gray-500">({pokemon.moves?.length || 0}/4)</span>
            </label>
            
            {/* 選択された技のタグ一覧 */}
            <div className="flex flex-wrap gap-2 mb-2">
              {(pokemon.moves || []).map((moveId) => (
                <div key={moveId} className="flex items-center bg-gray-700 border border-gray-600 rounded-full pl-3 pr-1 py-1">
                  <span className="text-sm text-gray-100 font-bold mr-2">{getMoveName(moveId)}</span>
                  <button 
                    onClick={() => handleRemoveMove(moveId)}
                    className="bg-gray-800 text-gray-400 hover:text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* 技検索 */}
            {(pokemon.moves?.length || 0) < 4 && (
              <AutocompleteField
                items={masterData?.moves || []}
                placeholder={isLoading ? "データを読み込み中..." : "ひらがなで検索 (例: じしん)"}
                disabled={isLoading}
                onSelect={handleAddMove}
              />
            )}
          </div>
        </div>

      </div>
    </>
  );
}