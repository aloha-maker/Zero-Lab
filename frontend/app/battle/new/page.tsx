'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useBattleStore } from '../store/useBattleStore';
import { PartySelector } from '../components/PartySelector';
import { SeasonSelector } from '../components/SeasonSelector';
import { PokemonListItem } from '../../types/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ==========================================
// ユーティリティ関数
// ==========================================

// 入力された「ひらがな」を「カタカナ」に変換する関数（検索のゆらぎ吸収用）
const hiraToKata = (str: string) =>
  str.replace(/[\u3041-\u3096]/g, (match) =>
    String.fromCharCode(match.charCodeAt(0) + 0x60)
  );

// ==========================================
// コンポーネント本体
// ==========================================

export default function NewBattlePage() {
  const router = useRouter();
  const { initializeMatch, myPartyBuilds, ruleId, seasonId } = useBattleStore();

  // ルールに紐づくポケモンマスターデータ
  const [pokemonMaster, setPokemonMaster] = useState<PokemonListItem[]>([]);
  const [isMasterLoading, setIsMasterLoading] = useState(false);

  // 選択された6匹のデータ (初期状態はnull)
  const [selectedPokemons, setSelectedPokemons] = useState<(PokemonListItem | null)[]>([
    null, null, null, null, null, null,
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🌟 seasonId が変化したらポケモン候補を Backend API から再取得
  // （アクティブシーズンから常に取得）
  useEffect(() => {
    if (!seasonId) {
      setPokemonMaster([]);
      return;
    }

    const fetchPokemonList = async () => {
      setIsMasterLoading(true);
      // シーズン変更時は選択済みポケモンをリセット
      setSelectedPokemons([null, null, null, null, null, null]);
      setSearchQuery('');

      try {
        const res = await fetch(`${API_BASE}/api/v1/seasons/latest_pokemons`);
        if (!res.ok) throw new Error('Failed to fetch pokemon list');
        const data = await res.json();
        setPokemonMaster(data.pokemons);
      } catch (error) {
        console.error('🔥 ポケモン一覧のフェッチに失敗しました:', error);
      } finally {
        setIsMasterLoading(false);
      }
    };

    fetchPokemonList();
  }, [seasonId]);

  // 💡 インクリメンタルサーチ（重複排除あり）
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const normalizedQuery = hiraToKata(searchQuery);

    const results = pokemonMaster
      .filter(
        (p) =>
          p.name.includes(normalizedQuery) ||
          p.name.includes(searchQuery) ||
          p.english_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 20);

    // pokemon_id で重複を排除
    return Array.from(new Map(results.map(p => [p.pokemon_id, p])).values());
  }, [searchQuery, pokemonMaster]);

  const handleSelectPokemon = (pokemon: PokemonListItem) => {
    const emptyIndex = selectedPokemons.findIndex((p) => p === null);
    if (emptyIndex !== -1) {
      const newSelected = [...selectedPokemons];
      newSelected[emptyIndex] = pokemon;
      setSelectedPokemons(newSelected);
      setSearchQuery('');
    }
  };

  const handleRemovePokemon = (indexToRemove: number) => {
    const newSelected = [...selectedPokemons];
    newSelected[indexToRemove] = null;
    setSelectedPokemons(newSelected);
  };

  const handleStartBattle = async () => {
    if (selectedPokemons.includes(null)) return;
    setIsSubmitting(true);

    try {
      const initialPokemons = selectedPokemons.map((p, index) => ({
        base_pokemon_id: p!.pokemon_id,
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

      const response = await fetch(`${API_BASE}/battles/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: '00000000-0000-0000-0000-000000000000',
          season_id: seasonId ?? undefined,
          opponent_team: initialPokemons,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔥バックエンドからのエラー詳細:', response.status, errorText);
        throw new Error(`Failed to create battle: ${response.status}`);
      }

      const data = await response.json();
      initializeMatch(data.id, data.opponent_pokemons);
      router.push(`/battle/${data.id}`);
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  const isReady = seasonId !== null && !isMasterLoading;

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white p-4">
      <h1 className="text-xl font-bold mb-4">相手のパーティを入力</h1>

      {/* シーズン選択 */}
      <SeasonSelector />

      {/* 自分のパーティ選択 */}
      <PartySelector />

      {/* 選択された6匹のスロット */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {selectedPokemons.map((p, index) => (
          <div
            key={index}
            onClick={() => p && handleRemovePokemon(index)}
            className={`
              aspect-square rounded-lg flex flex-col items-center justify-center border transition-all p-1
              ${p
                ? 'bg-gray-700 border-blue-500 cursor-pointer hover:bg-gray-600'
                : 'bg-gray-800 border-gray-700'
              }
            `}
          >
            {p ? (
              <>
                <span className="text-[10px] text-gray-400 mb-0.5">枠 {index + 1}</span>
                <div className="relative w-12 h-12 mb-0.5">
                  <Image
                    src={
                      p.image_url ||
                      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.pokemon_id}.png`
                    }
                    alt={p.name}
                    fill
                    sizes="48px"
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <span className="text-xs font-bold text-center leading-tight px-1 truncate w-full">
                  {p.name}
                </span>
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
          placeholder={
            !seasonId
              ? 'シーズンを選択してください'
              : isMasterLoading
              ? 'データを読み込み中...'
              : 'ひらがな・カタカナ・英語で検索...'
          }
          disabled={!isReady}
          className="w-full bg-gray-900 text-white rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700 disabled:opacity-50"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
        />

        <div className="flex flex-wrap gap-2 overflow-y-auto flex-1 pb-4">
          {searchResults.map((p) => (
            <button
              key={p.pokemon_id}
              className="flex items-center gap-1.5 bg-gray-700 border border-gray-600 pl-2 pr-4 py-1.5 rounded-full text-sm hover:bg-gray-600 active:bg-blue-600 active:border-blue-500 transition-colors"
              onClick={() => handleSelectPokemon(p)}
            >
              <div className="relative w-7 h-7">
                <Image
                  src={
                    p.image_url ||
                    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.pokemon_id}.png`
                  }
                  alt={p.name}
                  fill
                  sizes="28px"
                  className="object-contain"
                  unoptimized
                />
              </div>
              <span>{p.name}</span>
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
          disabled={selectedPokemons.includes(null) || isSubmitting || !isReady}
          className="w-full bg-blue-600 disabled:bg-gray-700 text-white font-bold py-4 rounded-xl transition-colors"
        >
          {isSubmitting ? '準備中...' : '対戦開始'}
        </button>
      </div>
    </div>
  );
}
