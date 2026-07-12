// frontend/features/candidate-screening/utils/screeningEngine.ts
// Reactに依存しない純粋関数群：フェーズ1〜3の選出判定ロジック

import { MatrixResultRow } from '@/features/TopTierMatchups/types/index';
import { Matchups, PokemonCandidate } from '../types';

/** フェーズ1のマトリクスから補完対象ターゲット（×・△判定）の行を抽出 */
export function extractTargetRows(matrixData: MatrixResultRow[]): MatrixResultRow[] {
  return matrixData.filter((row) => row.judgment === '×' || row.judgment === '△');
}

/** ターゲット行から動的な相性マップを生成する（×→◎、△→◯ とみなす） */
export function buildDynamicMatchups(targetRows: MatrixResultRow[]): Matchups {
  const matchups: Matchups = {};
  targetRows.forEach((tgt) => {
    matchups[tgt.opponent_name] = tgt.judgment === '×' ? '◎' : '◯';
  });
  return matchups;
}

/** 1匹で全ターゲットを◯以上にできる候補を抽出（単体採用パターン） */
export function findSinglePassCandidates(
  candidates: PokemonCandidate[],
  allTargets: string[]
): PokemonCandidate[] {
  return candidates.filter((pokemon) =>
    allTargets.every((targetName) => {
      const judgment = pokemon.matchups[targetName];
      return judgment === '◎' || judgment === '◯';
    })
  );
}

/** 2匹の組み合わせで全ターゲットを◯以上にできるペアを探索（ペア採用パターン） */
export function findPairCandidates(
  candidates: PokemonCandidate[],
  allTargets: string[]
): PokemonCandidate[] {
  const pairs: PokemonCandidate[] = [];

  for (let i = 0; i < candidates.length; i++) {
    for (let j = i + 1; j < candidates.length; j++) {
      const p1 = candidates[i];
      const p2 = candidates[j];

      const isPairComplementComplete = allTargets.every((targetName) => {
        const j1 = p1.matchups[targetName];
        const j2 = p2.matchups[targetName];
        return j1 === '◎' || j1 === '◯' || j2 === '◎' || j2 === '◯';
      });

      if (!isPairComplementComplete) continue;

      const mergedMatchups: Matchups = {};
      allTargets.forEach((targetName) => {
        const j1 = p1.matchups[targetName];
        mergedMatchups[targetName] = j1 === '◎' || j1 === '◯' ? j1 : p2.matchups[targetName];
      });

      pairs.push({
        name: `${p1.name} ＆ ${p2.name}`,
        isPair: true,
        matchups: mergedMatchups,
        archetypeTags: [...new Set([...p1.archetypeTags, ...p2.archetypeTags])],
        passChecks: [
          '[フェーズ3] 2匹の相性補完で全ターゲットを網羅（相互補完ペア）',
          `└ ${p1.name}の担当: ${allTargets.filter((t) => p1.matchups[t] !== '×').join(', ')}`,
          `└ ${p2.name}の担当: ${allTargets.filter((t) => p2.matchups[t] !== '×').join(', ')}`,
        ],
        rate: Math.floor((p1.rate + p2.rate) / 2),
        badgeColor: 'bg-purple-100 text-purple-700',
      });
    }
  }

  return pairs;
}

/**
 * フェーズ2をパスした候補から、フェーズ3の最終候補を決定する。
 * 単体で全ターゲットを補完できる候補があればそれを最優先とし、
 * なければ2匹のペアによる補完パターンを返す。
 */
export function resolveFinalCandidates(
  phase2Passed: PokemonCandidate[],
  allTargets: string[]
): PokemonCandidate[] {
  const singlePassCandidates = findSinglePassCandidates(phase2Passed, allTargets);

  if (singlePassCandidates.length > 0) {
    return singlePassCandidates.map((c) => ({
      ...c,
      passChecks: [...c.passChecks, '[フェーズ3] 単体ですべてのターゲットを補完可能【最優先】'],
    }));
  }

  return findPairCandidates(phase2Passed, allTargets);
}
