'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useBattleStore } from '../store/useBattleStore';
import { OpponentPokemon } from '../types';

// ==========================================
// 型定義とユーティリティ関数
// ==========================================

interface PokemonMaster {
  id: number;
  name: string;   // 英語名
  jaName: string; // 日本語名
  imageUrl: string;
}

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
  
  // PokeAPIから取得したマスターデータを格納するステート
  const [pokemonMaster, setPokemonMaster] = useState<PokemonMaster[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 選択された6匹のデータ (初期状態はnull)
  const [selectedPokemons, setSelectedPokemons] = useState<(PokemonMaster | null)[]>([
    null, null, null, null, null, null
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🌟 PokeAPI (GraphQL) から日本語名・英語名・IDを一括で取得
  useEffect(() => {
    async function loadPokemonData() {
      const query = `
        query {
          pokemon_v2_pokemon {
            id
            name
            pokemon_v2_pokemonspecy {
              pokemon_v2_pokemonspeciesnames(where: {language_id: {_eq: 11}}) {
                name
              }
            }
          }
        }
      `;

      try {
        const res = await fetch('https://beta.pokeapi.co/graphql/v1beta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        });

        if (!res.ok) throw new Error('PokeAPI GraphQL request failed');

        const { data } = await res.json();

        // 特定の伝説・禁止級枠を除外するフィルター設定
        const EXCLUDED_NAMES = [
          'zacian', 'zacian-crowned', 'zacian-hero',
          'miraidon',
          'calyrex', 'calyrex-ice', 'calyrex-shadow'
        ];

        const formatted: PokemonMaster[] = data.pokemon_v2_pokemon
          .filter((p: any) => !EXCLUDED_NAMES.includes(p.name))
          .map((p: any) => {
            const jaNameObj = p.pokemon_v2_pokemonspecy?.pokemon_v2_pokemonspeciesnames?.[0];
            return {
              id: p.id,
              name: p.name,
              jaName: jaNameObj ? jaNameObj.name : p.name, // 万が一日本語名がない場合は英語名
              imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`
            };
          });

        setPokemonMaster(formatted);
      } catch (error) {
        console.error('🔥 PokeAPIのフェッチに失敗しました:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadPokemonData();
  }, []);

  // 💡 【コア機能】インクリメンタルサーチ
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    // ユーザーが「ひらがな」で入力してもヒットするように正規化
    const normalizedQuery = hiraToKata(searchQuery);
    
    return pokemonMaster.filter(p => 
      p.jaName.includes(normalizedQuery) || 
      p.jaName.includes(searchQuery) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 20); // 描画負荷を抑えるため上位20件で打ち切り
  }, [searchQuery, pokemonMaster]);

  // ポケモンをタップして選択した時の処理
  const handleSelectPokemon = (pokemon: PokemonMaster) => {
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

  // 对戦開始ボタン押下時の処理
  const handleStartBattle = async () => {
    if (selectedPokemons.includes(null)) return;
    setIsSubmitting(true);

    try {
      const initialPokemons = selectedPokemons.map((p, index) => ({
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/battles/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: "00000000-0000-0000-0000-000000000000", 
          opponent_team: initialPokemons
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("🔥バックエンドからのエラー詳細:", response.status, errorText);
        throw new Error(`Failed to create battle: ${response.status}`);
      }
      
      const data = await response.json();

      // Storeを初期化してメイン画面へ遷移
      initializeMatch(data.id, data.opponent_pokemons);
      router.push(`/battle/${data.id}`);
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
              aspect-square rounded-lg flex flex-col items-center justify-center border transition-all p-1
              ${p ? 'bg-gray-700 border-blue-500 cursor-pointer hover:bg-gray-600' : 'bg-gray-800 border-gray-700'}
            `}
          >
            {p ? (
              <>
                <span className="text-[10px] text-gray-400 mb-0.5">枠 {index + 1}</span>
                {/* 🌟 選択済みスロットに画像を表示 */}
                <div className="relative w-12 h-12 mb-0.5">
                  <Image
                    src={p.imageUrl}
                    alt={p.jaName}
                    fill
                    sizes="48px"
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <span className="text-xs font-bold text-center leading-tight px-1 truncate w-full">{p.jaName}</span>
              </>
            ) : (
              <span className="text-gray-500 text-sm">枠 {index + 1}</span>
            )}
          </div>
        ))}
      </div>

      {/* 検索・サジェストエリア */}
      <div className="flex-1 bg-gray-800 rounded-t-2xl p-4 -mx-4 mt-auto border-t border-gray-700 flex flex-col overflow-hidden">
        <input
          type="text"
          placeholder={isLoading ? "データを読み込み中..." : "ひらがな・カタカナ・英語で検索..."}
          disabled={isLoading}
          className="w-full bg-gray-900 text-white rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700 disabled:opacity-50"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
        />
        
        {/* 検索結果のリスト */}
        <div className="flex flex-wrap gap-2 overflow-y-auto flex-1 pb-4">
          {searchResults.map((p) => (
            <button
              key={p.id}
              className="flex items-center gap-1.5 bg-gray-700 border border-gray-600 pl-2 pr-4 py-1.5 rounded-full text-sm hover:bg-gray-600 active:bg-blue-600 active:border-blue-500 transition-colors"
              onClick={() => handleSelectPokemon(p)}
            >
              {/* 🌟 サジェスト一覧に画像を表示 */}
              <div className="relative w-7 h-7">
                <Image
                  src={p.imageUrl}
                  alt={p.jaName}
                  fill
                  sizes="28px"
                  className="object-contain"
                  unoptimized
                />
              </div>
              <span>{p.jaName}</span>
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
          disabled={selectedPokemons.includes(null) || isSubmitting || isLoading}
          className="w-full bg-blue-600 disabled:bg-gray-700 text-white font-bold py-4 rounded-xl transition-colors"
        >
          {isSubmitting ? '準備中...' : '対戦開始'}
        </button>
      </div>
    </div>
  );
}