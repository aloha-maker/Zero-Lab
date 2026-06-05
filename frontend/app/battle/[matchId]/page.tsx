'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useBattleStore } from '../store/useBattleStore';
import { DetailDrawer } from '../components/DetailDrawer';

// ==========================================
// 型定義
// ==========================================
interface PokemonMaster {
  id: number;
  jaName: string;
  imageUrl: string;
}

export default function BattleDetailPage() {
  const params = useParams();
  const matchId = params.matchId as string;
  const router = useRouter();

  const {
    opponentTeam,
    toggleSelected,
    toggleFainted,
    toggleTera,
    setEditingSlot,
    editingSlot,
  } = useBattleStore();

  const [pokemonMaster, setPokemonMaster] = useState<Record<number, PokemonMaster>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // 🌟 勝敗登録モーダルの状態管理
  const [showResultModal, setShowResultModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // PokeAPI (GraphQL) からID・日本語名・画像を一括取得してマッピングを作成
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
        const mapping: Record<number, PokemonMaster> = {};

        data.pokemon_v2_pokemon.forEach((p: any) => {
          const jaName = p.pokemon_v2_pokemonspecy?.pokemon_v2_pokemonspeciesnames?.[0]?.name || p.name;
          mapping[p.id] = {
            id: p.id,
            jaName,
            imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`
          };
        });

        setPokemonMaster(mapping);
      } catch (error) {
        console.error('🔥 詳細画面でのPokeAPIフェッチに失敗しました:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadPokemonData();
  }, []);

  // 🌟 勝敗をバックエンドに送信して終了する処理
  const handleFinishBattle = async (result: 'win' | 'lose') => {
    setIsSubmitting(true);
    try {
      // バックエンドの仕様に合わせて PATCH または PUT で勝敗を更新
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/battles/${matchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result }) // ※APIスキーマに合わせて `is_win: true` など適宜変更してください
      });
    } catch (error) {
      console.error('勝敗の記録に失敗しました:', error);
    } finally {
      setIsSubmitting(false);
      setShowResultModal(false);
      router.push('/battle/new'); // 入力画面に戻る
    }
  };

  const currentPokemon = opponentTeam.find((p) => p.slot_order === editingSlot);
  const currentPokemonMaster = currentPokemon ? pokemonMaster[currentPokemon.base_pokemon_id] : null;

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white p-4 overflow-hidden relative">
      {/* ヘッダーエリア */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-blue-400">Zero-Lab: 対戦中メモ</h1>
        <button
          onClick={() => setShowResultModal(true)} // 🌟 モーダルを開くように変更
          className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
        >
          対戦終了
        </button>
      </div>

      {/* 盤面操作エリア（6匹のグリッド表示） */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {opponentTeam.map((p) => {
          const master = pokemonMaster[p.base_pokemon_id];
          const pokemonName = master ? master.jaName : `ID: ${p.base_pokemon_id}`;
          const pokemonImage = master ? master.imageUrl : null;

          return (
            <div
              key={p.slot_order}
              className={`
                relative aspect-square rounded-lg flex flex-col items-center justify-between p-2 border transition-all select-none
                ${p.is_fainted ? 'bg-gray-800 border-gray-700 opacity-40' : p.is_selected ? 'bg-gray-700 border-blue-500 ring-2 ring-blue-500/50' : 'bg-gray-800 border-gray-700'}
              `}
            >
              {/* 選出切り替え用の不可視のタップレイヤー */}
              <div 
                className="absolute inset-0 cursor-pointer z-0" 
                onClick={() => toggleSelected(p.slot_order)}
              />

              {/* 各種ステータス・UI要素 */}
              <div className="z-10 flex flex-col items-center w-full h-full justify-between pointer-events-none">
                <div className="flex justify-between w-full pointer-events-auto">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleTera(p.slot_order); }}
                    className={`text-[10px] px-1.5 py-0.5 rounded font-bold transition-colors ${p.is_tera_used ? 'bg-amber-500 text-black' : 'bg-gray-600 text-white'}`}
                  >
                    テラ
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFainted(p.slot_order); }}
                    className={`text-[10px] px-1.5 py-0.5 rounded font-bold transition-colors ${p.is_fainted ? 'bg-red-600 text-white' : 'bg-gray-600 text-white'}`}
                  >
                    ひんし
                  </button>
                </div>

                {pokemonImage && (
                  <div className="relative w-14 h-14 my-0.5">
                    <Image
                      src={pokemonImage}
                      alt={pokemonName}
                      fill
                      sizes="56px"
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                )}

                <span className="text-xs font-bold text-center leading-tight truncate w-full px-1">
                  {isLoading ? 'Loading...' : pokemonName}
                </span>

                <button
                  onClick={(e) => { e.stopPropagation(); setEditingSlot(p.slot_order); }}
                  className="pointer-events-auto mt-1 text-[10px] bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white px-2 py-0.5 rounded-full transition-colors"
                >
                  詳細
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 詳細ドロワーUI */}
      {currentPokemon && (
        <DetailDrawer
          isOpen={editingSlot !== null}
          onClose={() => setEditingSlot(null)}
          pokemon={currentPokemon}
          pokemonName={currentPokemonMaster ? currentPokemonMaster.jaName : `ID: ${currentPokemon.base_pokemon_id}`}
          pokemonImage={currentPokemonMaster ? currentPokemonMaster.imageUrl : undefined}
        />
      )}

      {/* 🌟 勝敗登録モーダル */}
      {showResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-in fade-in duration-200">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold text-center mb-6 text-white">対戦結果を記録</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => handleFinishBattle('win')}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-colors shadow-lg"
              >
                勝ち
              </button>
              <button
                onClick={() => handleFinishBattle('lose')}
                disabled={isSubmitting}
                className="bg-red-600 hover:bg-red-500 active:bg-red-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-colors shadow-lg"
              >
                負け
              </button>
            </div>

            <button
              onClick={() => setShowResultModal(false)}
              disabled={isSubmitting}
              className="w-full bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-gray-300 font-bold py-3 rounded-xl transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  );
}