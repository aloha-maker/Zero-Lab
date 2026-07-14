// frontend/features/candidate-screening/types/index.ts

/** 相性判定シンボル */
export type JudgmentSymbol = '◎' | '◯' | '×';

/** ターゲット名 → 判定シンボル のマップ（例: { 'ハバタクカミ': '◎', 'カイリュー': '◯' }） */
export type Matchups = { [targetName: string]: JudgmentSymbol };

/** 構築アーキタイプ */
export type Archetype = '対面' | 'サイクル' | '展開';

/** フェーズ4のチェックリスト用アイテム */
export interface RoleCheckItem {
  id: string;
  label: string;
  isChecked: boolean;
}

/** スクリーニングを通過した候補ポケモン（単体 or ペア採用） */
export interface PokemonCandidate {
  id?: number;          // ← 【追加】API呼び出し用にポケモンのIDを保持する
  name: string;
  isPair?: boolean;
  matchups: any;        // ※既存のMatchups型
  archetypeTags: string[];
  passChecks: string[];
  rate: number;
  badgeColor: string;
}