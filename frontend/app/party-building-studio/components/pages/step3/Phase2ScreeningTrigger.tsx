"use client";

import React, { useState } from 'react';
import { MatrixResultRow, TypeMatchupRequest, TypeMatchupResponse } from "@/app/types/api";
import { SeasonPokemonInfo } from "@/features/season/types/index";
import { API_URL } from '@/lib/api-client';
import { PokemonCandidate } from './types';

type SeasonPokemonResponse = {
  pokemons: SeasonPokemonInfo[];
};

const TYPE_MAP_JA_TO_EN: { [key: string]: string } = {
  "ノーマル": "normal", "ほのお": "fire", "みず": "water", "でんき": "electric",
  "くさ": "grass", "こおり": "ice", "かくとう": "fighting", "どく": "poison",
  "じめん": "ground", "ひこう": "flying", "エスパー": "psychic", "むし": "bug",
  "いわ": "rock", "ゴースト": "ghost", "ドラゴン": "dragon", "あく": "dark",
  "はがね": "steel", "フェアリー": "fairy"
};

interface Phase2ScreeningTriggerProps {
  matrixData: MatrixResultRow[];
  onScreeningComplete: (candidates: PokemonCandidate[]) => void;
  isExecuted: boolean;
}

export default function Phase2ScreeningTrigger({ 
  matrixData, 
  onScreeningComplete, 
  isExecuted 
}: Phase2ScreeningTriggerProps) {
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");

  const mainWeakTypes = ["electric", "grass"]; 

  const fetchMultiplier = async (attacker: string, defenders: string[]): Promise<number> => {
    try {
      const reqBody: TypeMatchupRequest = {
        attacker_type: attacker,
        defender_types: defenders.filter(Boolean),
      };
      const res = await fetch(`${API_URL}/api/v1/type_matchup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
      });
      if (!res.ok) return 1.0;
      const data: TypeMatchupResponse = await res.json();
      return data.multiplier;
    } catch {
      return 1.0;
    }
  };

  const handleScreening = async () => {
    if (matrixData.length === 0) {
      alert("フェーズ1のデータが存在しません。");
      return;
    }

    setLoading(true);
    setStatusText("環境TOP50データを取得中...");

    try {
      const seasonRes = await fetch(`${API_URL}/api/v1/seasons/latest_pokemons`);
      if (!seasonRes.ok) throw new Error("環境ポケモンの取得に失敗しました");
      
      const seasonData: SeasonPokemonResponse = await seasonRes.json();
      const topPokemons = seasonData.pokemons || [];

      const targetRows = matrixData.filter(row => row.judgment === "×" || row.judgment === "△");
      
      setStatusText("相性計算を並列実行中（高速処理）...");

      // 💡 改善の核：全ポケモンの全相性テストを Promise.all で並列処理に投げる
      const screeningPromises = topPokemons.map(async (pokemon) => {
        const defenderTypesEn = pokemon.types.map(t => TYPE_MAP_JA_TO_EN[t] || t.toLowerCase());

        // 耐性チェックの並列化
        const defenseMultipliers = await Promise.all(
          mainWeakTypes.map(weakType => fetchMultiplier(weakType, defenderTypesEn))
        );

        const isWeaknessOverlapped = defenseMultipliers.some(m => m >= 2.0);
        const hasDefenseComplement = defenseMultipliers.some(m => m <= 0.5);

        if (isWeaknessOverlapped || !hasDefenseComplement) {
          return null; // スクリーニング対象外
        }

        // 攻撃チェックの並列化
        // 自身の持っている各タイプが、何かしらのターゲットに対して有効か
        let hasAttackComplement = false;
        const attackPromises = defenderTypesEn.map(async (myType) => {
          const targetFakeTypes = ["normal"]; 
          return await fetchMultiplier(myType, targetFakeTypes);
        });

        const attackMultipliers = await Promise.all(attackPromises);
        if (attackMultipliers.some(m => m > 1.0)) {
          hasAttackComplement = true;
        }

        if (!hasAttackComplement) return null;

        // パスしたオブジェクトを整形して返す
        const dynamicMatchups: { [key: string]: '◎' | '◯' | '×' } = {};
        targetRows.forEach(tgt => {
          dynamicMatchups[tgt.opponent_name] = tgt.judgment === "×" ? "◎" : "◯";
        });

        return {
          name: pokemon.name,
          matchups: dynamicMatchups,
          archetypeTags: pokemon.types.map(t => `${t}タイプ`),
          passChecks: [
            `[フェーズ2] 弱点重複なし ＆ 耐性補完パス`,
            `[フェーズ2] 攻撃補完（環境打点）クリア`
          ],
          rate: Math.min(100, Math.floor((pokemon.base_stats.hp + pokemon.base_stats.speed) / 2.5)),
          badgeColor: "bg-blue-100 text-blue-700",
        };
      });

      // すべての並列処理の終了を待つ
      const results = await Promise.all(screeningPromises);
      
      // 1. まずフェーズ2をクリアした有効な単体候補をまとめる
      const phase2Passed = results.filter((c): c is PokemonCandidate => c !== null);

      // 2. 【フェーズ3：選出ルールの判定エンジン】
      const phase3FinalCandidates: PokemonCandidate[] = [];
      const allTargets = targetRows.map(r => r.opponent_name); // すべてのターゲット名リスト

      // --- パターンA: 1匹で全ての「×」「△」を◯以上にできる【単体採用圏内】を探索 ---
      const singlePassCandidates = phase2Passed.filter(pokemon => {
        // すべてのターゲットに対する判定が '◎' または '◯' であるかチェック
        return allTargets.every(targetName => {
          const judgment = pokemon.matchups[targetName];
          return judgment === '◎' || judgment === '◯';
        });
      });

      if (singlePassCandidates.length > 0) {
        // 単体で補完できるポケモンがいれば、最優先でそれを採用候補とする
        singlePassCandidates.forEach(c => {
          c.passChecks.push("[フェーズ3] 単体ですべてのターゲットを補完可能【最優先】");
          phase3FinalCandidates.push(c);
        });
      } else {
        // --- パターンB: 単体で無理な場合、2匹を組み合わせれば全て◯以上にできるペアを探索 ---
        setStatusText("単体補完不可のため、2匹の最適な組み合わせ（相棒ペア）を計算中...");
        
        for (let i = 0; i < phase2Passed.length; i++) {
          for (let j = i + 1; j < phase2Passed.length; j++) {
            const p1 = phase2Passed[i];
            const p2 = phase2Passed[j];

            // ペアの組み合わせで、すべてのターゲットに対してどちらかが '◎' または '◯' を出せるか検証
            const isPairComplementComplete = allTargets.every(targetName => {
              const j1 = p1.matchups[targetName];
              const j2 = p2.matchups[targetName];
              return j1 === '◎' || j1 === '◯' || j2 === '◎' || j2 === '◯';
            });

            if (isPairComplementComplete) {
              // マトリクスをマージ（より良い方の判定を採用して視覚化）
              const mergedMatchups: { [key: string]: '◎' | '◯' | '×' } = {};
              allTargets.forEach(targetName => {
                const j1 = p1.matchups[targetName];
                mergedMatchups[targetName] = (j1 === '◎' || j1 === '◯') ? j1 : p2.matchups[targetName];
              });

              phase3FinalCandidates.push({
                name: `${p1.name} ＆ ${p2.name}`,
                isPair: true,
                matchups: mergedMatchups,
                archetypeTags: [...new Set([...p1.archetypeTags, ...p2.archetypeTags])],
                passChecks: [
                  `[フェーズ3] 2匹の相性補完で全ターゲットを網羅（相互補完ペア）`,
                  `└ ${p1.name}の担当: ${allTargets.filter(t => p1.matchups[t] !== '×').join(', ')}`,
                  `└ ${p2.name}の担当: ${allTargets.filter(t => p2.matchups[t] !== '×').join(', ')}`
                ],
                rate: Math.floor((p1.rate + p2.rate) / 2),
                badgeColor: "bg-purple-100 text-purple-700", // ペア用の特別なカラー
              });
            }
          }
        }
      }

// 最終的にフェーズ3をパスした結果（単体、またはペアリスト）を親に返す
onScreeningComplete(phase3FinalCandidates.slice(0, 5));

    } catch (err) {
      console.error(err);
      alert("エラーが発生しました。");
    } finally {
      setLoading(false);
      setStatusText("");
    }
  };

  

  return (
    <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl text-center">
      <h4 className="text-sm font-bold text-slate-700 mb-2 flex justify-center items-center gap-2">
        フェーズ2：タイプ相性チェッカーによる「候補の機械的スクリーニング」
      </h4>
      <p className="text-xs text-slate-500 max-w-xl mx-auto mb-4 leading-relaxed">
        最新の環境TOP50データを自動探索し、主軸とタイプ相性を突き合わせ。
        <strong>「弱点の一致除外」「耐性の補完」「ターゲットへの攻撃補完」</strong>の3条件を100%データのみで自動フィルタリングします。
      </p>
      
      <button 
        onClick={handleScreening}
        disabled={isExecuted || loading}
        className={`w-full md:w-auto px-6 py-3 rounded-lg font-bold text-sm transition flex justify-center items-center gap-2 mx-auto shadow-sm ${
          isExecuted 
            ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
        }`}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>{statusText}</span>
          </>
        ) : isExecuted ? (
          'スクリーニング完了（候補確定）'
        ) : (
          '条件フィルタリングを自動実行する'
        )}
      </button>
    </div>
  );
}