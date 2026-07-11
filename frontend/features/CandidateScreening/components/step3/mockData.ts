// frontend/features/CandidateScreening/components/step3/mockData.ts
import { PokemonCandidate } from './types';

export const CANDIDATES_DATA: PokemonCandidate[] = [
  {
    name: 'ハッサム',
    matchups: { 'ハバタクカミ': '◎', 'カイリュー': '◯', 'サーフゴー': '◯' },
    archetypeTags: ['鋼枠', 'フェアリー受け', '対ハバタクカミ'],
    passChecks: ['[対面] 1ターン耐える手段（タスキ/耐久力）', '[サイクル] 对面操作技（とんぼがえり）'],
    rate: 95,
    badgeColor: 'bg-emerald-100 text-emerald-700',
  },
  {
    name: 'ヒードラン',
    matchups: { 'ハバタクカミ': '◯', 'カイリュー': '×', 'サーフゴー': '◎' },
    archetypeTags: ['特殊受け', '鋼枠', 'サイクル補完'],
    passChecks: ['[サイクル] 回復ソース（たべのこし持ち）'],
    rate: 88,
    badgeColor: 'bg-blue-100 text-blue-700',
  },
  {
    name: 'ドオー',
    matchups: { 'ハバタクカミ': '◯', 'カイリュー': '◯', 'サーフゴー': '×' },
    archetypeTags: ['物理受け', 'クッション'],
    passChecks: ['[サイクル] 回復技（じこさいせい）'],
    rate: 82,
    badgeColor: 'bg-yellow-100 text-yellow-700',
  },
];