'use client';

import { useEffect, useState } from 'react'; // 🌟 useState を追加
import { useRouter, useParams } from 'next/navigation';
import { useBattleStore } from '../store/useBattleStore';
import { PokemonIcon } from '../components/PokemonIcon';
import { DetailDrawer } from '../components/DetailDrawer';

export default function BattleMainPage() {
  const router = useRouter();
  const params = useParams();
  const matchId = params.matchId as string;

  // Storeから必要な状態を取得
  const opponentTeam = useBattleStore((state) => state.opponentTeam);
  const isSyncing = useBattleStore((state) => state.isSyncing);
  const syncError = useBattleStore((state) => state.syncError);

  // 🌟 モーダルの状態管理
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [isSubmittingResult, setIsSubmittingResult] = useState(false);

  useEffect(() => {
    if (!opponentTeam || opponentTeam.length === 0) {
      router.push('/battle/new');
    }
  }, [opponentTeam, router]);

  // 🌟 対戦結果を送信して終了する関数
  const handleFinishBattle = async (result: 'win' | 'lose' | 'draw') => {
    setIsSubmittingResult(true);
    try {
      // 1. バックエンドに結果を保存
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/battles/${matchId}/result`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result }),
      });

      if (!response.ok) throw new Error('Failed to update result');

      // 2. 次の対戦のために、新しいパーティ入力画面に戻る
      router.push('/battle/new');
      
    } catch (error) {
      console.error(error);
      alert('結果の保存に失敗しました');
      setIsSubmittingResult(false);
    }
  };

  if (!opponentTeam || opponentTeam.length === 0) {
    return <div className="h-screen bg-gray-900 flex items-center justify-center text-white">読み込み中...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <header className="flex justify-between items-center p-4 border-b border-gray-800">
        <h1 className="font-bold text-lg">対戦メモ</h1>
        <div className="text-sm font-bold bg-gray-800 px-3 py-1 rounded-full">
          {isSyncing ? (
            <span className="text-blue-400">☁️ ↻ 同期中...</span>
          ) : syncError ? (
            <span className="text-red-400">☁️ ✕ エラー</span>
          ) : (
            <span className="text-green-400">☁️ ✓ 保存済</span>
          )}
        </div>
      </header>

      <main className="flex-1 p-4 overflow-y-auto pb-6">
        <div className="grid grid-cols-2 gap-4">
          {opponentTeam.map((pokemon) => (
            <PokemonIcon key={pokemon.slot_order} pokemon={pokemon} />
          ))}
        </div>
      </main>

      <DetailDrawer />
      
      {/* 🌟 修正: クリックでモーダルを開く */}
      <div className="p-4 border-t border-gray-800 bg-gray-900">
         <button 
           onClick={() => setIsFinishModalOpen(true)}
           className="w-full bg-red-900/50 text-red-200 border border-red-800 py-4 rounded-xl font-bold transition-colors hover:bg-red-900/80 active:bg-red-800"
         >
            対戦を終了して記録
         </button>
      </div>

      {/* 🌟 追加: 対戦結果を選択するモーダル */}
      {isFinishModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm border border-gray-700 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-center mb-6 text-white">対戦結果を記録</h2>
            <div className="flex flex-col gap-3">
              <button 
                disabled={isSubmittingResult}
                onClick={() => handleFinishBattle('win')}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors"
              >
                勝ち 🏆
              </button>
              <button 
                disabled={isSubmittingResult}
                onClick={() => handleFinishBattle('lose')}
                className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-colors"
              >
                負け 💀
              </button>
              <button 
                disabled={isSubmittingResult}
                onClick={() => handleFinishBattle('draw')}
                className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 rounded-xl transition-colors"
              >
                引き分け 🤝
              </button>
            </div>
            <div className="mt-6">
              <button 
                disabled={isSubmittingResult}
                onClick={() => setIsFinishModalOpen(false)}
                className="w-full text-gray-400 font-bold py-2 text-sm"
              >
                キャンセルして戻る
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}