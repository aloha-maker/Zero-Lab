'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
// 既存のドロワーとストア、型定義を正しくインポート
import { DetailDrawer } from '../components/DetailDrawer';
import { useBattleStore } from '../store/useBattleStore';
import { OpponentPokemon } from '../types';
import { API_URL } from "@/app/types/constants";

// ==========================================
// 型定義
// ==========================================
interface PokemonMaster {
  id: number;
  jaName: string;
  imageUrl: string;
}

// AI選出支援パネル用の型定義
interface BattleAdviceRequest {
  my_party: string[];
  enemy_party: string[];
  rule: 'single' | 'double';
  regulation: string;
}

interface BattleAdviceResponse {
  recommended_selection: string[];
  lead_pokemon: string;
  reasons: string[];
  threats: string[];
  notes: string[];
}

// ==========================================
// AI選出支援コンポーネント
// ==========================================
function BattleAdvicePanel({
  myParty,
  enemyParty,
  rule = 'single',
  regulation = 'レギュレーションG',
}: {
  myParty: string[];
  enemyParty: string[];
  rule?: 'single' | 'double';
  regulation?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<BattleAdviceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGetAdvice = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/battles/advice`, {

        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          my_party: myParty.filter(p => p !== ''),
          enemy_party: enemyParty.filter(p => p !== ''),
          rule,
          regulation,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'AI選出支援の取得に失敗しました。');
      }

      const result = await response.json();
      setAdvice(result);
    } catch (err: any) {
      setError(err.message || 'エラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-900 shadow-sm my-6 border-gray-700 text-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-bold text-gray-100 flex items-center gap-2">
          🔮 AI選出シンクアドバイザー
        </h3>
        {!advice && !loading && (
          <button
            onClick={handleGetAdvice}
            disabled={myParty.filter(p => p !== '').length === 0 || enemyParty.filter(p => p !== '').length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-4 rounded-md text-xs transition disabled:bg-gray-700"
          >
            AI選出支援を開始
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-950 text-red-200 p-3 rounded-md text-xs mb-3 border border-red-800">
          ⚠️ {error}
          <button onClick={handleGetAdvice} className="ml-3 underline font-medium hover:text-red-100">
            再試行
          </button>
        </div>
      )}

      {loading && (
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-700 rounded w-1/3"></div>
          <div className="flex gap-3 my-2">
            <div className="h-10 bg-gray-700 rounded w-20"></div>
            <div className="h-10 bg-gray-700 rounded w-20"></div>
            <div className="h-10 bg-gray-700 rounded w-20"></div>
          </div>
          <p className="text-xs text-gray-400 text-center animate-bounce mt-2">
            AIが最適な選出ルートを計算中...（約3秒）
          </p>
        </div>
      )}

      {advice && !loading && (
        <div className="space-y-4 text-gray-300">
          <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
            <span className="text-xs font-semibold text-blue-400 uppercase block mb-2">推奨される選出パターン</span>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-red-600 text-white px-1.5 py-0.5 rounded font-bold">初手</span>
                <div className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-700 shadow-sm min-w-[70px] text-center">
                  {advice.lead_pokemon}
                </div>
              </div>
              <div className="h-8 w-px bg-gray-700 hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-gray-500 text-white px-1.5 py-0.5 rounded font-bold">後発</span>
                <div className="flex gap-2">
                  {advice.recommended_selection
                    .filter((p) => p !== advice.lead_pokemon)
                    .map((pokemon, idx) => (
                      <div key={idx} className="bg-gray-800 text-gray-200 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-700 shadow-sm min-w-[70px] text-center">
                        {pokemon}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-gray-800/50 p-3 rounded-md border border-gray-800">
              <h4 className="font-bold text-gray-200 mb-1.5 flex items-center gap-1 text-xs">
                ✅ 選出的中・狙い
              </h4>
              <ul className="list-disc pl-4 space-y-1 text-xs text-gray-400">
                {advice.reasons.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>

            <div className="bg-amber-950/30 p-3 rounded-md border border-amber-900/50">
              <h4 className="font-bold text-amber-400 mb-1.5 flex items-center gap-1 text-xs">
                ⚠️ 警戒すべき相手
              </h4>
              <ul className="list-disc pl-4 space-y-1 text-xs text-amber-200/80">
                {advice.threats.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>

            <div className="bg-red-950/30 p-3 rounded-md border border-red-900/50">
              <h4 className="font-bold text-red-400 mb-1.5 flex items-center gap-1 text-xs">
                💡 立ち回りの注意点
              </h4>
              <ul className="list-disc pl-4 space-y-1 text-xs text-red-200/80">
                {advice.notes.map((n, i) => <li key={i}>{n}</li>)}
              </ul>
            </div>
          </div>

          <div className="text-right pt-1">
            <button
              onClick={handleGetAdvice}
              className="text-xs text-blue-400 hover:text-blue-300 underline font-medium"
            >
              再分析する
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// メイン詳細ページ
// ==========================================
export default function BattleDetailPage() {
  const params = useParams();
  const matchId = params.matchId as string;
  const router = useRouter();

  const {
    opponentTeam,
    myPartyBuilds,
    initializeMatch,
    toggleSelected,
    toggleFainted,
    setEditingSlot,
    editingSlot,
  } = useBattleStore();

  const [pokemonMaster, setPokemonMaster] = useState<Record<number, PokemonMaster>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  const [showResultModal, setShowResultModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleFinishBattle = async (result: 'win' | 'lose') => {
    setIsSubmitting(true);
    try {
      await fetch(`${API_URL}/battles/${matchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result })
      });
    } catch (error) {
      console.error('勝敗の記録に失敗しました:', error);
    } finally {
      setIsSubmitting(false);
      setShowResultModal(false);
      router.push('/battle/new');
    }
  };

  const currentPokemon = opponentTeam.find((p) => p.slot_order === editingSlot);
  const currentPokemonMaster = currentPokemon ? pokemonMaster[currentPokemon.base_pokemon_id] : null;

  const myPartyNames = myPartyBuilds.map(b => b.pokemon_name);
  const enemyPartyNames = opponentTeam.map(p => pokemonMaster[p.base_pokemon_id]?.jaName || '???');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        <span className="ml-3 text-sm">データを同期中...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-bold">LIVE BATTLE TRACER</h1>
            <p className="text-xs text-gray-400">Match ID: {matchId}</p>
          </div>
          <button
            onClick={() => setShowResultModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 px-4 rounded text-xs transition shadow-md"
          >
            対戦を終了する
          </button>
        </div>

        {/* 相手のパーティグリッド表示 */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-sm mb-6">
          <h2 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
            ⚔️ 対戦相手のパーティ（タップで選出 / Wタップでひんし）
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            {opponentTeam.map((p) => {
              const master = pokemonMaster[p.base_pokemon_id];
              const pokemonImage = master ? master.imageUrl : null;

              return (
                <div
                  key={p.slot_order}
                  onClick={() => toggleSelected(p.slot_order)}
                  onDoubleClick={() => toggleFainted(p.slot_order)}
                  className={`relative aspect-square rounded-lg flex flex-col items-center justify-between p-2 border transition-all select-none cursor-pointer ${
                    p.is_fainted
                      ? 'bg-gray-900 border-gray-800 opacity-40'
                      : p.is_selected
                      ? 'bg-gray-700 border-blue-500 ring-2 ring-blue-500/50'
                      : 'bg-gray-800 border-gray-700'
                  }`}
                >
                  <span className="text-[10px] text-gray-500 font-bold self-start">枠 {p.slot_order}</span>
                  {pokemonImage && (
                    <div className="relative w-16 h-16 my-1">
                      <Image src={pokemonImage} alt={master?.jaName || ''} fill className="object-contain" />
                    </div>
                  )}
                  <span className="text-xs font-bold truncate max-w-full text-gray-200">{master?.jaName || '???'}</span>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingSlot(p.slot_order);
                    }}
                    className="absolute bottom-1 right-1 bg-gray-700 hover:bg-gray-600 px-1 py-0.5 rounded text-[10px] text-gray-300"
                  >
                    📝
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI選出支援パネル */}
        <BattleAdvicePanel 
          myParty={myPartyNames}
          enemyParty={enemyPartyNames}
          rule="single"
          regulation="レギュレーションG"
        />

      </div>

      {/* 既存の詳細編集ドロワー */}
      {/* 🌟 根本解決: currentPokemon が存在する時のみレンダリングし、型エラーを完全に解消 */}
      {currentPokemon && (
        <DetailDrawer
          isOpen={editingSlot !== null}
          onClose={() => setEditingSlot(null)}
          pokemon={currentPokemon}
          pokemonName={currentPokemonMaster ? currentPokemonMaster.jaName : `ID: ${currentPokemon.base_pokemon_id}`}
          pokemonImage={currentPokemonMaster ? currentPokemonMaster.imageUrl : undefined}
        />
      )}

      {/* 勝敗登録モーダル */}
      {showResultModal && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center p-4 z-50 animate-fade-in">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-base font-bold text-gray-100 mb-2 text-center">対戦結果の記録</h3>
            <p className="text-xs text-gray-400 mb-4 text-center">この試合の勝敗を選択して終了します。</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleFinishBattle('win')}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded text-sm transition disabled:bg-gray-700"
              >
                勝利 (WIN)
              </button>
              <button
                onClick={() => handleFinishBattle('lose')}
                disabled={isSubmitting}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded text-sm transition disabled:bg-gray-700"
              >
                敗北 (LOSE)
              </button>
            </div>
            <button
              onClick={() => setShowResultModal(false)}
              className="mt-4 w-full border border-gray-600 text-gray-400 hover:text-gray-200 py-1.5 rounded text-xs transition"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  );
}