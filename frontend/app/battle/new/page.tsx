'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useBattleStore } from '../store/useBattleStore';
import { OpponentPokemon } from '../types';

// ==========================================
// マスターデータとユーティリティ関数
// ==========================================

// 仮のマスターデータ（※本番では既存APIや静的JSONから取得します）
const POKEMON_MASTER = [
  { id: 987, name: 'ハバタクカミ', kana: 'ハバタクカミ' },
  { id: 1004, name: 'イーユイ', kana: 'イーユイ' },
  { id: 445, name: 'ガブリアス', kana: 'ガブリアス' },
  { id: 149, name: 'カイリュー', kana: 'カイリュー' },
  { id: 1001, name: 'パオジアン', kana: 'パオジアン' },
  { id: 1011, name: 'オーガポン', kana: 'オーガポン' },
  { id: 1024, name: 'テラパゴス', kana: 'テラパゴス' },
  { id: 132, name: 'メタモン', kana: 'メタモン' },
];

// 入力された「ひらがな」を「カタカナ」に変換する関数（検索のゆらぎ吸収用）
const hiraToKata = (str: string) => {
  return str.replace(/[\u3041-\u3096]/g, (match) =>
    String.fromCharCode(match.charCodeAt(0) + 0x60)
  );
};

// ==========================================
// コンポーネント本体
// ==========================================

export default function NewBattlePage() {
  const router = useRouter();
  const initializeMatch = useBattleStore((state) => state.initializeMatch);
  
  // 選択された6匹のデータ (初期状態はnull)
  const [selectedPokemons, setSelectedPokemons] = useState<(typeof POKEMON_MASTER[0] | null)[]>([
    null, null, null, null, null, null
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 💡 【コア機能】インクリメンタルサーチ
  // 入力文字(searchQuery)が変わるたびに爆速でフィルタリングを実行
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    // ユーザーは「ひらがな」で入力する可能性が高いため、カタカナに正規化して検索
    const normalizedQuery = hiraToKata(searchQuery);
    
    return POKEMON_MASTER.filter(p => 
      p.kana.includes(normalizedQuery) || p.name.includes(searchQuery)
    ).slice(0, 10); // 画面に収まるよう上位10件で打ち切る（レンダリングの爆速化）
  }, [searchQuery]);

  // ポケモンをタップして選択した時の処理
  const handleSelectPokemon = (pokemon: typeof POKEMON_MASTER[0]) => {
    const emptyIndex = selectedPokemons.findIndex(p => p === null);
    if (emptyIndex !== -1) {
      const newSelected = [...selectedPokemons];
      newSelected[emptyIndex] = pokemon;
      setSelectedPokemons(newSelected);
      setSearchQuery(''); // 🌟 連続で入力できるよう検索バーを即座にリセット
    }
  };

  // 選択済みポケモンをタップして解除（取り消し）する処理
  const handleRemovePokemon = (indexToRemove: number) => {
    const newSelected = [...selectedPokemons];
    newSelected[indexToRemove] = null;
    setSelectedPokemons(newSelected);
  };

  // 対戦開始ボタン押下時の処理
  const handleStartBattle = async () => {
    if (selectedPokemons.includes(null)) return;
    setIsSubmitting(true);

    try {
      const dummyMatchId = crypto.randomUUID();

      const initialPokemons: OpponentPokemon[] = selectedPokemons.map((p, index) => ({
        base_pokemon_id: p!.id,
        slot_order: index + 1,
        is_selected: false,
        is_fainted: false,
        is_tera_used: false,
        is_mega_used: false,
        tera_type: null,
        item_id: null,
        ability_id: null,
        moves: [],
      }));

      // Storeに保存してメイン画面へ遷移
      initializeMatch(initialPokemons);
      router.push(`/battle/${dummyMatchId}`);
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white p-4">
      <h1 className="text-xl font-bold mb-4">相手のパーティを入力</h1>

      {/* 選択された6匹のスロット */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {selectedPokemons.map((p, index) => (
          <div 
            key={index} 
            onClick={() => p && handleRemovePokemon(index)}
            className={`
              aspect-square rounded-lg flex flex-col items-center justify-center border transition-all
              ${p ? 'bg-gray-700 border-blue-500 cursor-pointer hover:bg-gray-600' : 'bg-gray-800 border-gray-700'}
            `}
          >
            {p ? (
              <>
                <span className="text-xs text-gray-400 mb-1">枠 {index + 1}</span>
                <span className="text-sm font-bold text-center leading-tight px-1">{p.name}</span>
                {/* ここに img タグ等でアイコンを表示すると更に良くなります */}
              </>
            ) : (
              <span className="text-gray-500 text-sm">枠 {index + 1}</span>
            )}
          </div>
        ))}
      </div>

      {/* 検索・サジェストエリア */}
      <div className="flex-1 bg-gray-800 rounded-t-2xl p-4 -mx-4 mt-auto border-t border-gray-700">
        <input
          type="text"
          placeholder="ひらがなで検索 (例: かい...)"
          className="w-full bg-gray-900 text-white rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
        />
        
        {/* 検索結果のリスト */}
        <div className="flex flex-wrap gap-2 overflow-y-auto max-h-[40vh] pb-4">
          {searchResults.map((p) => (
            <button
              key={p.id}
              className="bg-gray-700 border border-gray-600 px-4 py-2 rounded-full text-sm active:bg-blue-600 active:border-blue-500 transition-colors"
              onClick={() => handleSelectPokemon(p)}
            >
              {p.name}
            </button>
          ))}
          
          {searchQuery && searchResults.length === 0 && (
            <p className="text-gray-400 text-sm p-2">見つかりませんでした</p>
          )}
        </div>
      </div>

      {/* 開始ボタン */}
      <div className="pt-4 pb-2 bg-gray-900 -mx-4 px-4 border-t border-gray-800">
        <button
          onClick={handleStartBattle}
          disabled={selectedPokemons.includes(null) || isSubmitting}
          className="w-full bg-blue-600 disabled:bg-gray-700 text-white font-bold py-4 rounded-xl transition-colors"
        >
          {isSubmitting ? '準備中...' : '対戦開始 (90秒)'}
        </button>
      </div>
    </div>
  );
}