'use client';

import { useBattleStore } from '../store/useBattleStore';

// 簡易的な18タイプの定義
const TERA_TYPES = [
  'ノーマル', 'ほのお', 'みず', 'でんき', 'くさ', 'こおり',
  'かくとう', 'どく', 'じめん', 'ひこう', 'エスパー', 'むし',
  'いわ', 'ゴースト', 'ドラゴン', 'あく', 'はがね', 'フェアリー'
];

export function DetailDrawer() {
  const editingSlot = useBattleStore((state) => state.editingSlot);
  const setEditingSlot = useBattleStore((state) => state.setEditingSlot);
  const opponentTeam = useBattleStore((state) => state.opponentTeam);
  const updatePokemonDetail = useBattleStore((state) => state.updatePokemonDetail);
  const toggleTera = useBattleStore((state) => state.toggleTera);

  // 現在編集中のポケモンデータを取得
  const targetPokemon = opponentTeam.find(p => p.slot_order === editingSlot);

  // 開かれていない場合は何も表示しない
  if (!targetPokemon) return null;

  return (
    <>
      {/* 背景の暗転（タップで閉じる） */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={() => setEditingSlot(null)}
      />

      {/* ドロワー本体 */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 rounded-t-2xl z-50 p-4 pb-8 max-h-[85vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-full duration-200">
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">
            枠 {targetPokemon.slot_order} の詳細メモ
          </h2>
          <button 
            onClick={() => setEditingSlot(null)}
            className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm"
          >
            閉じる
          </button>
        </div>

        {/* テラスタルボタン（勝敗に直結する重要情報） */}
        <div className="mb-6 bg-gray-800 p-3 rounded-xl border border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-sm text-gray-300">💎 テラスタル使用</span>
            <button
              onClick={() => toggleTera(targetPokemon.slot_order)}
              className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                targetPokemon.is_tera_used ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
              }`}
            >
              {targetPokemon.is_tera_used ? '使用済み' : '未使用'}
            </button>
          </div>
          
          <div className="text-sm font-bold text-gray-300 mb-2">判明したテラスタイプ</div>
          <div className="grid grid-cols-6 gap-2">
            {TERA_TYPES.map(type => (
              <button
                key={type}
                onClick={() => updatePokemonDetail(targetPokemon.slot_order, { tera_type: type })}
                className={`text-[10px] py-2 rounded border ${
                  targetPokemon.tera_type === type 
                    ? 'bg-white text-black border-white font-bold' 
                    : 'bg-gray-700 border-gray-600 text-gray-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* 持ち物・特性・技のメモ（Phase1なので自由入力テキスト） */}
        <div className="space-y-4">
          {/* ※本来は itemId 等ですが、Phase1の簡易実装としてまずはテキストで持つ想定のUIです */}
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