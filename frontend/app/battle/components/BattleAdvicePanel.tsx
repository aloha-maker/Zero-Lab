'use client';

import React, { useState } from 'react';
import { BattleAdviceRequest, BattleAdviceResponse } from '../types';
import { fetchBattleAdvice } from '../services/advice';

interface BattleAdvicePanelProps {
  myParty: string[];      // 例: ['ザシアン', 'カイリュー', ...]
  enemyParty: string[];   // 相手の登録された6体
  rule?: 'single' | 'double';
  regulation?: string;
}

export default function BattleAdvicePanel({
  myParty,
  enemyParty,
  rule = 'single',
  regulation = 'レギュレーションG',
}: BattleAdvicePanelProps) {
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<BattleAdviceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGetAdvice = async () => {
    setLoading(true);
    setError(null);
    try {
      const request: BattleAdviceRequest = {
        // 空文字の登録枠を除外してクリーンなデータを送信
        my_party: myParty.filter((p) => p !== ''),
        enemy_party: enemyParty.filter((p) => p !== ''),
        rule,
        regulation,
      };
      const result = await fetchBattleAdvice(request);
      setAdvice(result);
    } catch (err: any) {
      setError(err.message || 'エラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm my-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          🔮 AI選出シンクアドバイザー
        </h3>
        {!advice && !loading && (
          <button
            onClick={handleGetAdvice}
            disabled={myParty.filter((p) => p !== '').length === 0 || enemyParty.filter((p) => p !== '').length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-4 rounded-md text-sm transition disabled:bg-gray-300"
          >
            AI選出支援を開始
          </button>
        )}
      </div>

      {/* エラー表示 (F-009) */}
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm mb-3 border border-red-200">
          ⚠️ {error}
          <button onClick={handleGetAdvice} className="ml-3 underline font-medium hover:text-red-900">
            再試行
          </button>
        </div>
      )}

      {/* ローディング表示（目標3秒の体感速度を向上させるスケルトン） */}
      {loading && (
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="flex gap-3 my-2">
            <div className="h-10 bg-gray-200 rounded w-20"></div>
            <div className="h-10 bg-gray-200 rounded w-20"></div>
            <div className="h-10 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <p className="text-xs text-gray-400 text-center animate-bounce mt-2">
            AIが最適な選出ルートを計算中...（約3秒）
          </p>
        </div>
      )}

      {/* 分析結果の表示 (F-008) */}
      {advice && !loading && (
        <div className="space-y-4 text-sm text-gray-700">
          {/* 推奨選出・初手 */}
          <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
            <span className="text-xs font-semibold text-blue-800 uppercase block mb-2">推奨される選出パターン</span>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded font-bold">初手</span>
                {/* 🌟 既存の複雑なPokemonIconではなく、プレーンで綺麗なバッジ表現に修正してエラーを解消 */}
                <div className="bg-gray-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm min-w-[70px] text-center">
                  {advice.lead_pokemon}
                </div>
              </div>
              <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-gray-500 text-white px-1.5 py-0.5 rounded font-bold">後発</span>
                <div className="flex gap-2">
                  {advice.recommended_selection
                    .filter((p) => p !== advice.lead_pokemon)
                    .map((pokemon, idx) => (
                      <div key={idx} className="bg-gray-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm min-w-[70px] text-center">
                        {pokemon}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* 3つの主要セクション（選出理由・警戒・注意点） */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* 選出理由 */}
            <div className="bg-gray-50 p-3 rounded-md">
              <h4 className="font-bold text-gray-800 mb-1.5 flex items-center gap-1 text-xs">
                ✅ 選出的中・狙い
              </h4>
              <ul className="list-disc pl-4 space-y-1 text-xs text-gray-600">
                {advice.reasons.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>

            {/* 警戒すべきポケモン */}
            <div className="bg-amber-50/60 p-3 rounded-md border border-amber-100">
              <h4 className="font-bold text-amber-800 mb-1.5 flex items-center gap-1 text-xs">
                ⚠️ 警戒すべき相手
              </h4>
              <ul className="list-disc pl-4 space-y-1 text-xs text-amber-900/80">
                {advice.threats.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>

            {/* 对戦時の注意点 */}
            <div className="bg-red-50/50 p-3 rounded-md border border-red-100">
              <h4 className="font-bold text-red-800 mb-1.5 flex items-center gap-1 text-xs">
                💡 立ち回りの注意点
              </h4>
              <ul className="list-disc pl-4 space-y-1 text-xs text-red-900/80">
                {advice.notes.map((n, i) => <li key={i}>{n}</li>)}
              </ul>
            </div>
          </div>

          {/* 再分析ボタン */}
          <div className="text-right pt-1">
            <button
              onClick={handleGetAdvice}
              className="text-xs text-blue-600 hover:text-blue-800 underline font-medium"
            >
              パーティを変更して再分析する
            </button>
          </div>
        </div>
      )}
    </div>
  );
}