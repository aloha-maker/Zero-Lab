// app/strategy/screens/Step2Screen.tsx
"use client";

import React, { useState } from 'react';
import { MatrixResultRow } from '@/app/types/api';
import Phase1TargetList from './components/step2/Phase1TargetList';
import Phase2ScreeningTrigger from './components/step2/Phase2ScreeningTrigger';
import Phase3MatchupMatrix from './components/step2/Phase3MatchupMatrix';
import Phase4RoleChecker from './components/step2/Phase4RoleChecker';
import { PokemonCandidate } from './components/step2/types';

interface Step2ScreenProps {
  matrixData: MatrixResultRow[];
}

export default function Step2Screen({ matrixData }: Step2ScreenProps) {
  const [isScreened, setIsScreened] = useState(false);
  // APIスクリーニングで絞り込まれた本物の候補リストを格納するState
  const [candidates, setCandidates] = useState<PokemonCandidate[]>([]);

  const handleScreeningComplete = (filteredResults: PokemonCandidate[]) => {
    setCandidates(filteredResults);
    setIsScreened(true);
  };

  return (
    <section className="space-y-6 max-w-4xl mx-auto p-4 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
            ⚙️ 構築の軸・機械的スクリーニング
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            手順1のマトリクス結果から、ターゲットを自動抽出して補完候補を絞り込みます。
          </p>
        </div>

        {/* フェーズ1 */}
        <Phase1TargetList matrixData={matrixData} />

        {/* フェーズ2: API連携対応ロジック */}
        <Phase2ScreeningTrigger 
          matrixData={matrixData}
          onScreeningComplete={handleScreeningComplete} 
          isExecuted={isScreened} 
        />
      </div>

      {/* 下部：スクリーニング結果表示（フェーズ3 & 4） */}
      {isScreened && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              📋 フェーズ3・4 検証通過ルート（採用候補：{candidates.length}匹）
            </h3>
            <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">環境データベースより抽出</span>
          </div>

          {candidates.length > 0 ? (
            <div className="space-y-4">
              {candidates.map((pokemon, idx) => (
                <div key={idx} className="border border-slate-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-md transition-all duration-300 bg-white">
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-lg text-slate-800 tracking-tight">{pokemon.name}</h4>
                        <span className={`${pokemon.badgeColor} px-2.5 py-0.5 rounded-full text-xs font-black`}>
                          適合率 {pokemon.rate}%
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {pokemon.archetypeTags.map((tag, tIdx) => (
                          <span key={tIdx} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                        ✓ タイプ相性補完検証パス
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Phase3MatchupMatrix matchups={pokemon.matchups} />
                    <Phase4RoleChecker 
                      // アーキタイプを動的に渡す（必要に応じてStateで管理）
                      archetype="対面" 
                      
                      // checkedItems の形に合わせるために map を使用して変換
                      checkedItems={pokemon.passChecks.map((text, index) => ({
                        id: `${pokemon.name}-${index}`,
                        label: text,
                        isChecked: false // 初期状態
                      }))}
                      
                      // トグル処理の定義
                      onToggleCheck={(id) => {
                        console.log("チェック切り替え:", id);
                        // ここで必要に応じて State を更新するロジックを入れます
                      }}
                    />
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic text-center py-6">
              すべての条件（弱点・耐性・攻撃補完）を満たす組み合わせが現在の候補に見つかりませんでした。
            </p>
          )}

          {/* 結論セクション */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-4 rounded-xl mt-6">
            <h5 className="font-bold text-blue-900 text-sm flex items-center gap-1.5">
              💡 結論の導出
            </h5>
            <p className="text-xs text-blue-800/90 mt-1 leading-relaxed">
              上記のフェーズ1〜4をすべてクリアした2匹（あるいは3匹）は、主軸の弱点を数値と耐性で完璧に補い、かつ戦術テンプレに沿ったロジックの破綻がない<strong>「最強の相棒（基本選出の軸）」</strong>となります。
            </p>
          </div>

        </div>
      )}
    </section>
  );
}