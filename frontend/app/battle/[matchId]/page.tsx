// frontend/app/battle/[matchId]/page.tsx
'use client';

import { use, useEffect } from 'react';
import { useBattleStore } from '../store/useBattleStore';
import { PokemonIcon } from '../components/PokemonIcon';
import { DetailDrawer } from '../components/DetailDrawer';
// import { SyncStatus } from '../../components/SyncStatus'; // 後述のクラウド同期アイコン

export default function BattleMainPage({ params }: { params: Promise<{ matchId: string }> }) {
  // App Routerの仕様により、paramsはPromiseとして扱う
  const { matchId } = use(params);
  
  const opponentTeam = useBattleStore((state) => state.opponentTeam);
  const isSyncing = useBattleStore((state) => state.isSyncing);
  const syncError = useBattleStore((state) => state.syncError);

  // TODO: 直接URLアクセスされた場合、FastAPIから試合データをフェッチしてStoreを復元する処理
  useEffect(() => {
    if (opponentTeam.length === 0) {
      // fetchMatchData(matchId).then(data => initializeMatch(data));
    }
  }, [matchId, opponentTeam.length]);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* ヘッダーエリア */}
      <header className="flex justify-between items-center p-4 border-b border-gray-800">
        <div className="flex space-x-2">
          {/* テラスタル全体管理トグルなど */}
          <button className="bg-gray-800 px-3 py-1 rounded text-sm border border-gray-700">
            テラスタル 💎
          </button>
        </div>
        
        {/* バックグラウンド同期状態のインジケーター */}
        <div className="text-sm flex items-center">
          {syncError ? (
            <span className="text-red-400">☁️ ❌ 失敗</span>
          ) : isSyncing ? (
            <span className="text-gray-400">☁️ ↻ 同期中</span>
          ) : (
            <span className="text-green-400">☁️ ✓ 保存済</span>
          )}
        </div>
      </header>

      {/* 盤面 (6匹のアイコン配置) */}
      <main className="flex-1 p-4">
        <div className="grid grid-cols-2 gap-4">
          {opponentTeam.map((pokemon) => (
            <PokemonIcon key={pokemon.slot_order} pokemon={pokemon} />
          ))}
        </div>
      </main>

      {/* 詳細情報入力ドロワー (長押しなどで展開する想定) */}
      <DetailDrawer />
      
      {/* 対戦終了ボタン */}
      <div className="p-4 border-t border-gray-800">
         <button className="w-full bg-red-900/50 text-red-200 border border-red-800 py-3 rounded-lg font-bold">
            対戦を終了して記録
         </button>
      </div>
    </div>
  );
}