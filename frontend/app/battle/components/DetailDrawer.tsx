'use client';

import Image from 'next/image';
import { useBattleStore } from '../store/useBattleStore';
import { OpponentPokemon } from '../types';

// 簡易的な18タイプの定義
const TERA_TYPES = [
  'ノーマル', 'ほのお', 'みず', 'でんき', 'くさ', 'こおり',
  'かくとう', 'どく', 'じめん', 'ひこう', 'エスパー', 'むし',
  'いわ', 'ゴースト', 'ドラゴン', 'あく', 'はがね', 'フェアリー'
];

// 🌟 親コンポーネントから受け取る Props の型定義を追加
interface DetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pokemon: OpponentPokemon;
  pokemonName: string;
  pokemonImage?: string;
}

export function DetailDrawer({ isOpen, onClose, pokemon, pokemonName, pokemonImage }: DetailDrawerProps) {
  // Storeからは更新用のアクションのみを取得
  const updatePokemonDetail = useBattleStore((state) => state.updatePokemonDetail);
  const toggleTera = useBattleStore((state) => state.toggleTera);

  // 🌟 isOpen が false、または pokemon が存在しない場合は描画しない
  if (!isOpen || !pokemon) return null;

  return (
    <>
      {/* 背景の暗転（タップで閉じる） */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* ドロワー本体 */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 rounded-t-2xl z-50 p-4 pb-8 max-h-[85vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-full duration-200">
        
        <div className="flex justify-between items-center mb-4">
          {/* 🌟 枠番号の代わりにポケモンの画像と名前を表示 */}
          <div className="flex items-center gap-2">
            {pokemonImage && (
              <div className="relative w-8 h-8">
                <Image
                  src={pokemonImage}
                  alt={pokemonName}
                  fill
                  sizes="32px"
                  className="object-contain"
                  unoptimized
                />
              </div>
            )}
            <h2 className="text-lg font-bold text-white">
              {pokemonName} のメモ
            </h2>
          </div>
          
          <button 
            onClick={onClose}
            className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm hover:bg-gray-700"
          >
            閉じる
          </button>
        </div>

        {/* テラスタルボタン（勝敗に直結する重要情報） */}
        <div className="mb-6 bg-gray-800 p-3 rounded-xl border border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-sm text-gray-300">💎 テラスタル使用</span>
            <button
              onClick={() => toggleTera(pokemon.slot_order)}
              className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                pokemon.is_tera_used ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
              }`}
            >
              {pokemon.is_tera_used ? '使用済み' : '未使用'}
            </button>
          </div>
          
          <div className="text-sm font-bold text-gray-300 mb-2">判明したテラスタイプ</div>
          <div className="grid grid-cols-6 gap-2">
            {TERA_TYPES.map(type => (
              <button
                key={type}
                onClick={() => updatePokemonDetail(pokemon.slot_order, { tera_type: type })}
                className={`text-[10px] py-2 rounded border transition-colors ${
                  pokemon.tera_type === type 
                    ? 'bg-white text-black border-white font-bold' 
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* 持ち物・特性・技のメモ（Phase1なので自由入力テキスト） */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">持ち物</label>
            <input 
              type="text" 
              placeholder="例: こだわりスカーフ" 
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">特性</label>
            <input 
              type="text" 
              placeholder="例: マルチスケイル" 
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">判明した技 (最大4つ)</label>
            <textarea 
              rows={3}
              placeholder="じしん / しんそく / ..." 
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

      </div>
    </>
  );
}