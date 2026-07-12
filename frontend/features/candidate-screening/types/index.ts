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
  /** 単体の場合は名前、ペアの場合は「ハッサム ＆ ヒードラン」など */
  name: string;
  /** ペア採用かどうかのフラグ */
  isPair?: boolean;
  matchups: Matchups;
  archetypeTags: string[];
  passChecks: string[];
  rate: number;
  badgeColor: string;
}
