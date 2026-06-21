"use client";

import React, { useState, useEffect } from 'react';

// ==========================================
// TYPES & INTERFACES FOR ICONS & STATE
// ==========================================

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  title?: string;
}

// ==========================================
// CUSTOM INLINE SVG ICONS (TypeScript Compliant)
// ==========================================

const Plus = ({ className = "w-4 h-4", title, ...props }: IconProps) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const Trash = ({ className = "w-4 h-4", title, ...props }: IconProps) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const BookOpen = ({ className = "w-4 h-4", title, ...props }: IconProps) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const Shield = ({ className = "w-4 h-4", title, ...props }: IconProps) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const TrendingUp = ({ className = "w-4 h-4", title, ...props }: IconProps) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const RotateCcw = ({ className = "w-4 h-4", title, ...props }: IconProps) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3" />
  </svg>
);

const CircleCheck = ({ className = "w-4 h-4", title, ...props }: IconProps) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Download = ({ className = "w-4 h-4", title, ...props }: IconProps) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const Upload = ({ className = "w-4 h-4", title, ...props }: IconProps) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const TriangleAlert = ({ className = "w-4 h-4", title, ...props }: IconProps) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const Check = ({ className = "w-4 h-4", title, ...props }: IconProps) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const ChevronRight = ({ className = "w-4 h-4", title, ...props }: IconProps) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const Info = ({ className = "w-4 h-4", title, ...props }: IconProps) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Sparkles = ({ className = "w-4 h-4", title, ...props }: IconProps) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const Layers = ({ className = "w-4 h-4", title, ...props }: IconProps) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const RefreshCw = ({ className = "w-4 h-4", title, ...props }: IconProps) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3" />
  </svg>
);

const BarChart = ({ className = "w-4 h-4", title, ...props }: IconProps) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const ListPlus = ({ className = "w-4 h-4", title, ...props }: IconProps) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m-9 1h3m-3-3h3m-3-3h3m1.2-5h10.6c.66 0 1.2.54 1.2 1.2v11.6c0 .66-.54 1.2-1.2 1.2H4.2c-.66 0-1.2-.54-1.2-1.2V4.2c0-.66.54-1.2 1.2-1.2z" />
  </svg>
);

const CircleHelp = ({ className = "w-4 h-4", title, ...props }: IconProps) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Clipboard = ({ className = "w-4 h-4", title, ...props }: IconProps) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

// ==========================================
// DATA STRUCTURES
// ==========================================

interface BaseStats {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}

interface PokemonData {
  id: string;
  name: string;
  type1: string;
  type2: string;
  ability: string;
  item: string;
  moves: string[];
  nature: string;
  effortValues: BaseStats;
  role: string;
  description: string;
}

interface Threat {
  id: string;
  name: string;
  dangerousMoves: string;
  countermeasures: string;
}

interface BattleRecord {
  id: string;
  date: string;
  result: 'win' | 'lose';
  opponentParty: string[];
  mySelected: string[];
  causeOfWinLose: string;
  reflection: string;
}

interface ChangeLog {
  id: string;
  date: string;
  pokemonOut: string;
  pokemonIn: string;
  reason: string;
}

interface AppState {
  currentPhase: number;
  environment: {
    concept: string;
    conceptDetails: string;
    threats: Threat[];
  };
  pokemon: (PokemonData | null)[];
  battles: BattleRecord[];
  changeLogs: ChangeLog[];
  checklists: { [key: string]: boolean };
}

// ==========================================
// CONSTANTS & MASTER DATA
// ==========================================

const PHASES = [
  { id: 1, name: "1. 環境分析", description: "ターゲット選定とコンセプト決定" },
  { id: 2, name: "2. 1匹目の採用", description: "構築の絶対的なエース・軸の選定" },
  { id: 3, name: "3. 2,3匹目の採用", description: "軸を支えるサイクル・相性補完" },
  { id: 4, name: "4,5匹目の採用", description: "裏の選出パターン・対応力の拡張" },
  { id: 5, name: "5. 6匹目の採用", description: "ラストピース・特定のメタ枠" },
  { id: 6, name: "6. 戦績分析", description: "バトルログ記録と勝率・選出率の可視化" },
  { id: 7, name: "7. 変更ログ", description: "試行錯誤の歴史を辿る" }
];

const CHECKLIST_ITEMS: { [key: number]: { id: string; label: string }[] } = {
  1: [
    { id: 'c1_1', label: '環境の主要な脅威を3匹以上ピックアップした' },
    { id: 'c1_2', label: '構築の基本コンセプト（対面・サイクル・展開）を決めた' },
    { id: 'c1_3', label: '軸にしたい戦術や勝ち筋を1つ以上言語化した' }
  ],
  2: [
    { id: 'c2_1', label: '1匹目の努力値調整・技構成を決定した' },
    { id: 'c2_2', label: '1匹目の「役割」を明確にした' },
    { id: 'c2_3', label: 'このポケモンを出すことで勝てる対面パターンを理解している' }
  ],
  3: [
    { id: 'c3_1', label: '1匹目の弱点を補う（クッション/相棒）の2匹目を決めた' },
    { id: 'c3_2', label: '3匹目のアタッカー、またはスイーパーを採用した' },
    { id: 'c3_3', label: '基本選出3匹（1-2-3）で勝つシナジーが成立している' }
  ],
  4: [
    { id: 'c4_1', label: '基本選出が通らない場合の「裏選出（4匹目・5匹目）」を定義した' },
    { id: 'c4_2', label: '相手の特定の受け崩し・妨害ギミックに対抗できる枠を用意した' },
    { id: 'c4_3', label: '全体の物理・特殊攻撃バランスが偏っていないか確認した' }
  ],
  5: [
    { id: 'c5_1', label: '受けループや特定のマイナー構築を崩す「ラストピース（6匹目）」を採用した' },
    { id: 'c5_2', label: '6匹すべてのタイプ相性補完を左サイドバーでチェックした' },
    { id: 'c5_3', label: '選出画面で相手に「見せる（圧力をかける）」ための誘導力を考慮した' }
  ],
  6: [
    { id: 'c6_1', label: '実際に実戦（ランクマ・フリー）で最低5戦以上戦った' },
    { id: 'c6_2', label: '勝敗だけでなく、「選出された相手」と「敗因」をすべて記録した' },
    { id: 'c6_3', label: '勝率5割未満の要因（特定のポケモンが一貫している等）を抽出した' }
  ],
  7: [
    { id: 'c7_1', label: '勝率の低い弱点枠を1匹交代し、そのログを残した' },
    { id: 'c7_2', label: '変更前後でタイプ相性の一貫性が悪化していないか確認した' },
    { id: 'c7_3', label: '変更後の実戦を再開し、構築のサイクルを回し始めた' }
  ]
};

const TYPES: { [key: string]: { name: string; color: string; bg: string } } = {
  normal: { name: "ノーマル", color: "#94a3b8", bg: "bg-slate-400" },
  fire: { name: "ほのお", color: "#f97316", bg: "bg-orange-500" },
  water: { name: "みず", color: "#3b82f6", bg: "bg-blue-500" },
  grass: { name: "くさ", color: "#22c55e", bg: "bg-green-500" },
  electric: { name: "でんき", color: "#eab308", bg: "bg-yellow-500" },
  ice: { name: "こおり", color: "#06b6d4", bg: "bg-cyan-500" },
  fighting: { name: "かくとう", color: "#ef4444", bg: "bg-red-500" },
  poison: { name: "どく", color: "#a855f7", bg: "bg-purple-500" },
  ground: { name: "じめん", color: "#ca8a04", bg: "bg-yellow-600" },
  flying: { name: "ひこう", color: "#60a5fa", bg: "bg-blue-400" },
  psychic: { name: "エスパー", color: "#ec4899", bg: "bg-pink-500" },
  bug: { name: "むし", color: "#84cc16", bg: "bg-lime-500" },
  rock: { name: "いわ", color: "#a16207", bg: "bg-yellow-700" },
  ghost: { name: "ゴースト", color: "#6366f1", bg: "bg-indigo-500" },
  dragon: { name: "ドラゴン", color: "#4f46e5", bg: "bg-indigo-600" },
  dark: { name: "あく", color: "#475569", bg: "bg-slate-600" },
  steel: { name: "はがね", color: "#64748b", bg: "bg-slate-500" },
  fairy: { name: "フェアリー", color: "#f472b6", bg: "bg-pink-400" },
  none: { name: "なし", color: "#64748b", bg: "bg-zinc-700" }
};

const NATURES = [
  { name: "いじっぱり (A↑ C↓)", up: "atk", down: "spa" },
  { name: "ひかえめ (C↑ A↓)", up: "spa", down: "atk" },
  { name: "ようき (S↑ C↓)", up: "spe", down: "spa" },
  { name: "おくびょう (S↑ A↓)", up: "spe", down: "atk" },
  { name: "わんぱく (B↑ C↓)", up: "def", down: "spa" },
  { name: "ずぶとい (B↑ A↓)", up: "def", down: "atk" },
  { name: "しんちょう (D↑ C↓)", up: "spd", down: "spa" },
  { name: "おだやか (D↑ A↓)", up: "spd", down: "atk" },
  { name: "ゆうかん (A↑ S↓)", up: "atk", down: "spe" },
  { name: "れいせい (C↑ S↓)", up: "spa", down: "spe" },
  { name: "のんき (B↑ S↓)", up: "def", down: "spe" },
  { name: "なまいき (D↑ S↓)", up: "spd", down: "spe" },
  { name: "むじゃき (S↑ D↓)", up: "spe", down: "spd" },
  { name: "せっかち (S↑ B↓)", up: "spe", down: "def" },
  { name: "さみしがり (A↑ B↓)", up: "atk", down: "def" },
  { name: "おっとり (C↑ B↓)", up: "spa", down: "def" },
  { name: "やんちゃ (A↑ D↓)", up: "atk", down: "spd" },
  { name: "うっかりや (C↑ D↓)", up: "spa", down: "spd" },
  { name: "てれや (補正なし)", up: null, down: null },
  { name: "がんばりや (補正なし)", up: null, down: null },
  { name: "すなお (補正なし)", up: null, down: null },
  { name: "きまぐれ (補正なし)", up: null, down: null },
  { name: "まじめ (補正なし)", up: null, down: null },
];

const PRESET_POKEMON: Omit<PokemonData, 'id' | 'role' | 'description'>[] = [
  { name: "カイリュー", type1: "dragon", type2: "flying", ability: "マルチスケイル", item: "こだわりハチマキ", moves: ["しんそく", "げきりん", "じしん", "アイアンヘッド"], nature: "いじっぱり (A↑ C↓)", effortValues: { hp: 196, atk: 252, def: 4, spa: 0, spd: 12, spe: 44 } },
  { name: "ハバタクカミ", type1: "ghost", type2: "fairy", ability: "こだいかっせい", item: "ブーストエナジー", moves: ["ムーンフォース", "シャドーボール", "マジカルフレイム", "めいそう"], nature: "おくびょう (S↑ A↓)", effortValues: { hp: 4, atk: 0, def: 4, spa: 248, spd: 4, spe: 252 } },
  { name: "サーフゴー", type1: "steel", type2: "ghost", ability: "おうごんのからだ", item: "たべのこし", moves: ["ゴールドラッシュ", "シャドーボール", "じこさいせい", "わるだくみ"], nature: "ずぶとい (B↑ A↓)", effortValues: { hp: 244, atk: 0, def: 252, spa: 4, spd: 4, spe: 4 } },
  { name: "オーガポン(かまど)", type1: "grass", type2: "fire", ability: "かたやぶり", item: "かまどものめん", moves: ["ツタこんぼう", "ウッドホーン", "じゃれつく", "つるぎのまい"], nature: "ようき (S↑ C↓)", effortValues: { hp: 156, atk: 156, def: 4, spa: 0, spd: 12, spe: 180 } },
  { name: "ウーラオス(れんげき)", type1: "water", type2: "fighting", ability: "ふかしのこぶし", item: "きあいのタスキ", moves: ["すいりゅうれんだ", "インファイト", "アクアジェット", "れいとうパンチ"], nature: "いじっぱり (A↑ C↓)", effortValues: { hp: 4, atk: 252, def: 0, spa: 0, spd: 0, spe: 252 } },
  { name: "パオジアン", type1: "dark", type2: "ice", ability: "わざわいのつるぎ", item: "いのちのたま", moves: ["つららおとし", "ふいうち", "せいなるつるぎ", "つるぎのまい"], nature: "ようき (S↑ C↓)", effortValues: { hp: 4, atk: 252, def: 0, spa: 0, spd: 0, spe: 252 } },
  { name: "ディンルー", type1: "ground", type2: "dark", ability: "わざわいのうつわ", item: "オボンのみ", moves: ["じしん", "カタストロフィ", "ステルスロック", "ふきとばし"], nature: "わんぱく (B↑ C↓)", effortValues: { hp: 252, atk: 4, def: 244, spa: 0, spd: 8, spe: 0 } },
  { name: "ブリジュラス", type1: "steel", type2: "dragon", ability: "じきゅうりょく", item: "パワフルハーブ", moves: ["ラスターカノン", "りゅうせいぐん", "エレクトロビーム", "ステルスロック"], nature: "おくびょう (S↑ A↓)", effortValues: { hp: 4, atk: 0, def: 4, spa: 248, spd: 4, spe: 252 } },
  { name: "ガチグマ(アカツキ)", type1: "ground", type2: "normal", ability: "しんがん", item: "とつげきチョッキ", moves: ["ブラッドムーン", "だいちのちから", "しんくうは", "ハイパーボイス"], nature: "ひかえめ (C↑ A↓)", effortValues: { hp: 244, atk: 0, def: 12, spa: 236, spd: 12, spe: 4 } },
  { name: "コライドン", type1: "fighting", type2: "dragon", ability: "ひひいろのこどう", item: "こだわりスカーフ", moves: ["アクセルブレイク", "げきりん", "フレアドライブ", "とんぼがえり"], nature: "ようき (S↑ C↓)", effortValues: { hp: 4, atk: 252, def: 0, spa: 0, spd: 0, spe: 252 } },
  { name: "ミライドン", type1: "electric", type2: "dragon", ability: "ハドロンエンジン", item: "こだわりメガネ", moves: ["イナズマドライブ", "りゅうせいぐん", "ボルトチェンジ", "マジカルシャイン"], nature: "おくびょう (S↑ A↓)", effortValues: { hp: 4, atk: 0, def: 0, spa: 252, spd: 0, spe: 252 } },
  { name: "キョジオーン", type1: "rock", type2: "none", ability: "きよめのしお", item: "たべのこし", moves: ["しおづけ", "じこさいせい", "てっぺき", "ボディプレス"], nature: "わんぱく (B↑ C↓)", effortValues: { hp: 252, atk: 0, def: 252, spa: 0, spd: 4, spe: 0 } },
  { name: "アシレーヌ", type1: "water", type2: "fairy", ability: "げきりゅう", item: "こだわりメガネ", moves: ["うたかたのアリア", "ムーンフォース", "サイコノイズ", "アクアジェット"], nature: "ひかえめ (C↑ A↓)", effortValues: { hp: 252, atk: 0, def: 4, spa: 252, spd: 0, spe: 0 } },
  { name: "イーユイ", type1: "dark", type2: "fire", ability: "わざわいのたま", item: "こだわりスカーフ", moves: ["オーバーヒート", "あくのはどう", "かえんほうしゃ", "サイコキネシス"], nature: "おくびょう (S↑ A↓)", effortValues: { hp: 4, atk: 0, def: 4, spa: 248, spd: 0, spe: 252 } },
  { name: "ランドロス(霊獣)", type1: "ground", type2: "flying", ability: "いかく", item: "ゴツゴツメット", moves: ["じしん", "がんせきふうじ", "とんぼがえり", "ステルスロック"], nature: "わんぱく (B↑ C↓)", effortValues: { hp: 252, atk: 4, def: 252, spa: 0, spd: 0, spe: 0 } }
];

const BASE_SPECIES_STATS: { [key: string]: BaseStats } = {
  "カイリュー": { hp: 91, atk: 134, def: 95, spa: 100, spd: 100, spe: 80 },
  "ハバタクカミ": { hp: 55, atk: 55, def: 55, spa: 135, spd: 135, spe: 135 },
  "サーフゴー": { hp: 87, atk: 60, def: 95, spa: 133, spd: 91, spe: 84 },
  "オーガポン(かまど)": { hp: 80, atk: 120, def: 84, spa: 60, spd: 96, spe: 110 },
  "ウーラオス(れんげき)": { hp: 100, atk: 130, def: 100, spa: 63, spd: 60, spe: 97 },
  "パオジアン": { hp: 80, atk: 120, def: 80, spa: 90, spd: 65, spe: 135 },
  "ディンルー": { hp: 155, atk: 110, def: 125, spa: 55, spd: 80, spe: 45 },
  "ブリジュラス": { hp: 90, atk: 105, def: 130, spa: 125, spd: 65, spe: 85 },
  "ガチグマ(アカツキ)": { hp: 113, atk: 70, def: 120, spa: 135, spd: 65, spe: 52 },
  "コライドン": { hp: 100, atk: 135, def: 115, spa: 85, spd: 100, spe: 135 },
  "ミライドン": { hp: 100, atk: 85, def: 100, spa: 135, spd: 115, spe: 135 },
  "キョジオーン": { hp: 100, atk: 100, def: 130, spa: 45, spd: 90, spe: 35 },
  "アシレーヌ": { hp: 80, atk: 74, def: 74, spa: 126, spd: 116, spe: 60 },
  "イーユイ": { hp: 55, atk: 80, def: 80, spa: 135, spd: 120, spe: 120 },
  "ランドロス(霊獣)": { hp: 89, atk: 145, def: 90, spa: 105, spd: 80, spe: 91 }
};

const TYPE_CHART: { [key: string]: { [key: string]: number } } = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  electric: { water: 2, grass: 0.5, electric: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, grass: 0.5, electric: 2, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { grass: 2, electric: 0.5, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 }
};

// ==========================================
// HELPER FUNCTIONS (TypeScript Compliant)
// ==========================================

const getTypeNameJP = (typeKey: string): string => {
  return TYPES[typeKey]?.name || typeKey;
};

const calculateStat = (statName: keyof BaseStats, base: number, ev: number, natureName: string): number => {
  if (statName === 'hp') {
    if (base === 1) return 1; // ヌケニン考慮
    return Math.floor((base * 2 + 31 + Math.floor(ev / 4)) / 2) + 60;
  }

  const baseVal = Math.floor((base * 2 + 31 + Math.floor(ev / 4)) / 2) + 5;
  const natureObj = NATURES.find(n => n.name === natureName);
  if (!natureObj) return baseVal;

  if (natureObj.up === statName) {
    return Math.floor(baseVal * 1.1);
  }
  if (natureObj.down === statName) {
    return Math.floor(baseVal * 0.9);
  }
  return baseVal;
};

const INITIAL_STATE: AppState = {
  currentPhase: 1,
  environment: {
    concept: "対面構築 + クッション対面サイクル",
    conceptDetails: "カイリュー、ウーラオスの高火力な対面性能で数的有利を取り、裏のクッション枠（サーフゴー）で流しつつ終盤のハバタクカミで一気にスイープ（一掃）する勝ち筋を目指す。",
    threats: [
      { id: "1", name: "ハバタクカミ", dangerousMoves: "ムーンフォース, たたりめ, 電磁波", countermeasures: "サーフゴーを後出しして電磁波をカットし、鋼打点で負荷をかける" },
      { id: "2", name: "カイリュー", dangerousMoves: "りゅうのまい, しんそく, じしん", countermeasures: "こちらのウーラオス（れんげき）のすいりゅうれんだでマルチスケイルを貫通しつつ削る" }
    ]
  },
  pokemon: [
    {
      id: "p1",
      name: "カイリュー",
      type1: "dragon",
      type2: "flying",
      ability: "マルチスケイル",
      item: "こだわりハチマキ",
      moves: ["しんそく", "げきりん", "じしん", "アイアンヘッド"],
      nature: "いじっぱり (A↑ C↓)",
      effortValues: { hp: 196, atk: 252, def: 4, spa: 0, spd: 12, spe: 44 },
      role: "エース (対面物理アタッカー)",
      description: "構築の軸。圧倒的な対面性能と神速の縛り性能を活かして、初手の出し勝ちから一気に有利盤面を築く。"
    },
    {
      id: "p2",
      name: "サーフゴー",
      type1: "steel",
      type2: "ghost",
      ability: "おうごんのからだ",
      item: "たべのこし",
      moves: ["ゴールドラッシュ", "シャドーボール", "じこさいせい", "わるだくみ"],
      nature: "ずぶとい (B↑ A↓)",
      effortValues: { hp: 244, atk: 0, def: 252, spa: 4, spd: 4, spe: 4 },
      role: "クッション (受け・詰ませ枠)",
      description: "カイリューを電磁波やあくび、どくどくから守る特性枠。高い防御耐久力で引き先になり、隙を見て悪巧みで全抜きも狙う。"
    },
    {
      id: "p3",
      name: "ハバタクカミ",
      type1: "ghost",
      type2: "fairy",
      ability: "こだいかっせい",
      item: "ブーストエナジー",
      moves: ["ムーンフォース", "シャドーボール", "マジカルフレイム", "めいそう"],
      nature: "おくびょう (S↑ A↓)",
      effortValues: { hp: 4, atk: 0, def: 4, spa: 248, spd: 4, spe: 252 },
      role: "スイーパー (特殊特殊アタッカー)",
      description: "圧倒的な素早さから広範囲 of 特殊打点を通すラストの詰め役。カイリューの神速で削れた相手を確実にスイープする。"
    },
    null,
    null,
    null
  ],
  battles: [
    {
      id: "b1",
      date: "2026-06-20",
      result: "win",
      opponentParty: ["カイリュー", "ハバタクカミ", "ガチグマ", "ディンルー", "オーガポン", "ウーラオス"],
      mySelected: ["p1", "p2", "p3"],
      causeOfWinLose: "初手のカイリューで相手のオーガポンを誘発しつつ神速で突破、後続をサーフゴーで受けて完全に有利だった。",
      reflection: "サーフゴーのHPを削られすぎないよう、早めの自己再生タイミングに注意したい。"
    },
    {
      id: "b2",
      date: "2026-06-21",
      result: "lose",
      opponentParty: ["パオジアン", "ウーラオス", "イーユイ", "アシレーヌ", "キラフロル", "ブリジュラス"],
      mySelected: ["p1", "p3", "p2"],
      causeOfWinLose: "初手のキラフロルのステルスロックを許し、かつどくびしを踏まされて耐久サイクルが維持できなくなった。",
      reflection: "毒ビシ耐性がある鋼のサーフゴーを初手に合わせるか、毒無効をもう1枠増やしたい。"
    }
  ],
  changeLogs: [
    {
      id: "l1",
      date: "2026-06-20",
      pokemonOut: "なし (新規構築)",
      pokemonIn: "カイリュー、サーフゴー、ハバタクカミ",
      reason: "相性補完を意識した最強の3体基本選出として採用し、構築をスタートさせた。"
    }
  ],
  checklists: {
    'c1_1': true,
    'c1_2': true,
    'c1_3': true,
    'c2_1': true,
    'c2_2': true,
    'c2_3': true,
    'c3_1': true,
    'c3_2': true,
    'c3_3': true,
  }
};

// ==========================================
// COMPONENT MAIN
// ==========================================

export default function Page() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Next.js (SSR) Hydration Safety: Load from localStorage only on client mount
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pokemon_studio_data');
      if (saved) {
        try {
          setState(JSON.parse(saved));
        } catch (e) {
          // Fallback to initial sample state
        }
      }
    }
  }, []);

  // Auto Save to localStorage (Client-only)
  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      localStorage.setItem('pokemon_studio_data', JSON.stringify(state));
    }
  }, [state, isMounted]);

  const triggerNotification = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handlePhaseChange = (phaseId: number) => {
    setState(prev => ({ ...prev, currentPhase: phaseId }));
    setActiveSlot(null);
  };

  const handleChecklistToggle = (itemId: string) => {
    setState(prev => ({
      ...prev,
      checklists: {
        ...prev.checklists,
        [itemId]: !prev.checklists[itemId]
      }
    }));
  };

  const handleEnvUpdate = (key: 'concept' | 'conceptDetails', value: string) => {
    setState(prev => ({
      ...prev,
      environment: {
        ...prev.environment,
        [key]: value
      }
    }));
  };

  const handleAddThreat = () => {
    const newThreat: Threat = {
      id: crypto.randomUUID(),
      name: "",
      dangerousMoves: "",
      countermeasures: ""
    };
    setState(prev => ({
      ...prev,
      environment: {
        ...prev.environment,
        threats: [...prev.environment.threats, newThreat]
      }
    }));
  };

  const handleUpdateThreat = (id: string, field: keyof Threat, value: string) => {
    setState(prev => ({
      ...prev,
      environment: {
        ...prev.environment,
        threats: prev.environment.threats.map(t => t.id === id ? { ...t, [field]: value } : t)
      }
    }));
  };

  const handleDeleteThreat = (id: string) => {
    setState(prev => ({
      ...prev,
      environment: {
        ...prev.environment,
        threats: prev.environment.threats.filter(t => t.id !== id)
      }
    }));
  };

  const handlePokemonUpdate = (index: number, updated: PokemonData | null) => {
    setState(prev => {
      const newPokemon = [...prev.pokemon];
      newPokemon[index] = updated;
      return { ...prev, pokemon: newPokemon };
    });
  };

  const loadPreset = (index: number, presetName: string) => {
    const preset = PRESET_POKEMON.find(p => p.name === presetName);
    if (!preset) return;

    const newPoke: PokemonData = {
      id: crypto.randomUUID(),
      name: preset.name,
      type1: preset.type1,
      type2: preset.type2,
      ability: preset.ability,
      item: preset.item,
      moves: [...preset.moves],
      nature: preset.nature,
      effortValues: { ...preset.effortValues },
      role: "エース",
      description: "プリセットから読み込み。採用理由や努力値意図をここに追記しましょう。"
    };

    handlePokemonUpdate(index, newPoke);
    triggerNotification(`${presetName} を読み込みました！`);
  };

  const clearPokemonSlot = (index: number) => {
    if (confirm("本当にこのポケモンの登録を消去しますか？")) {
      handlePokemonUpdate(index, null);
      triggerNotification("スロットをクリアしました", "info");
    }
  };

  const [newBattle, setNewBattle] = useState<Omit<BattleRecord, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    result: 'win',
    opponentParty: ['', '', '', '', '', ''],
    mySelected: [],
    causeOfWinLose: '',
    reflection: ''
  });

  const handleAddBattle = () => {
    if (newBattle.mySelected.length === 0) {
      triggerNotification("選出したポケモンを1匹以上選んでください", "error");
      return;
    }
    const record: BattleRecord = {
      id: crypto.randomUUID(),
      ...newBattle,
      opponentParty: newBattle.opponentParty.filter(name => name.trim() !== '')
    };

    setState(prev => ({
      ...prev,
      battles: [record, ...prev.battles]
    }));

    setNewBattle({
      date: new Date().toISOString().split('T')[0],
      result: 'win',
      opponentParty: ['', '', '', '', '', ''],
      mySelected: [],
      causeOfWinLose: '',
      reflection: ''
    });
    triggerNotification("戦績を記録しました！");
  };

  const handleDeleteBattle = (id: string) => {
    if (confirm("このバトル履歴を削除しますか？")) {
      setState(prev => ({
        ...prev,
        battles: prev.battles.filter(b => b.id !== id)
      }));
      triggerNotification("戦績を削除しました", "info");
    }
  };

  const [newLog, setNewLog] = useState<Omit<ChangeLog, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    pokemonOut: '',
    pokemonIn: '',
    reason: ''
  });

  const handleAddChangeLog = () => {
    if (!newLog.pokemonOut.trim() || !newLog.pokemonIn.trim() || !newLog.reason.trim()) {
      triggerNotification("すべての項目を入力してください", "error");
      return;
    }
    const log: ChangeLog = {
      id: crypto.randomUUID(),
      ...newLog
    };
    setState(prev => ({
      ...prev,
      changeLogs: [log, ...prev.changeLogs]
    }));
    setNewLog({
      date: new Date().toISOString().split('T')[0],
      pokemonOut: '',
      pokemonIn: '',
      reason: ''
    });
    triggerNotification("変更ログを登録しました！");
  };

  const handleDeleteChangeLog = (id: string) => {
    if (confirm("この変更ログを削除しますか？")) {
      setState(prev => ({
        ...prev,
        changeLogs: prev.changeLogs.filter(l => l.id !== id)
      }));
      triggerNotification("ログを削除しました", "info");
    }
  };

  const resetAllData = () => {
    if (confirm("警告: すべてのデータ（構築、分析、戦績、ログ）がリセットされ、初期サンプルデータに戻ります。よろしいですか？")) {
      setState(INITIAL_STATE);
      triggerNotification("データをリセットしました", "info");
    }
  };

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `pokemon_party_studio_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerNotification("データをエクスポートしました");
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && Array.isArray(parsed.pokemon) && parsed.environment) {
            setState(parsed);
            triggerNotification("インポートに成功しました！");
          } else {
            triggerNotification("インポートデータのフォーマットが不正です", "error");
          }
        } catch (error) {
          triggerNotification("JSONファイルの解析に失敗しました", "error");
        }
      };
    }
  };

  const copyPartyToClipboard = () => {
    let text = `【ポケモン構築パーティ】\n■コンセプト: ${state.environment.concept}\n\n`;
    state.pokemon.forEach((p, idx) => {
      if (p) {
        text += `${idx + 1}. ${p.name} @ ${p.item}\n`;
        text += `タイプ: ${getTypeNameJP(p.type1)}${p.type2 && p.type2 !== 'none' ? '/' + getTypeNameJP(p.type2) : ''}\n`;
        text += `特性: ${p.ability} / 性格: ${p.nature}\n`;
        text += `努力値: H:${p.effortValues.hp} A:${p.effortValues.atk} B:${p.effortValues.def} C:${p.effortValues.spa} D:${p.effortValues.spd} S:${p.effortValues.spe}\n`;
        text += `役割: ${p.role}\n`;
        text += `技: ${p.moves.filter(m => m).join(', ')}\n`;
        text += `意図: ${p.description}\n\n`;
      } else {
        text += `${idx + 1}. (空きスロット)\n\n`;
      }
    });

    try {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      triggerNotification("パーティテキストをコピーしました！");
    } catch (e) {
      triggerNotification("クリップボードへのアクセスに失敗しました", "error");
    }
  };

  // ==========================================
  // TYPE MAP ANALYSIS CALCULATIONS
  // ==========================================

  const getPartyTypeAnalysis = () => {
    const analysis: { [key: string]: { weaknessCount: number; resistanceCount: number; immuneCount: number, pokemonWeak: string[], pokemonResist: string[] } } = {};
    const keys = Object.keys(TYPE_CHART);

    keys.forEach(k => {
      analysis[k] = { weaknessCount: 0, resistanceCount: 0, immuneCount: 0, pokemonWeak: [], pokemonResist: [] };
    });

    state.pokemon.forEach(p => {
      if (!p) return;
      const t1 = p.type1;
      const t2 = p.type2;

      keys.forEach(atkType => {
        const mult1 = TYPE_CHART[atkType]?.[t1] !== undefined ? TYPE_CHART[atkType][t1] : 1;
        const mult2 = t2 && t2 !== 'none' && TYPE_CHART[atkType]?.[t2] !== undefined ? TYPE_CHART[atkType][t2] : 1;
        const totalMult = mult1 * mult2;

        if (totalMult > 1) {
          analysis[atkType].weaknessCount += 1;
          analysis[atkType].pokemonWeak.push(p.name);
        } else if (totalMult === 0) {
          analysis[atkType].immuneCount += 1;
          analysis[atkType].pokemonResist.push(p.name);
        } else if (totalMult < 1) {
          analysis[atkType].resistanceCount += 1;
          analysis[atkType].pokemonResist.push(p.name);
        }
      });
    });

    return analysis;
  };

  const typeAnalysis = getPartyTypeAnalysis();
  const activePokemonCount = state.pokemon.filter(p => p !== null).length;

  const vulnerableTypes = Object.entries(typeAnalysis)
    .filter(([type, data]) => {
      return (data.weaknessCount >= 2 && (data.resistanceCount + data.immuneCount) <= 1) ||
             (activePokemonCount >= 3 && (data.resistanceCount + data.immuneCount) === 0);
    })
    .map(([type]) => type);

  // ==========================================
  // STATISTICS CALCULATIONS (BATTLE)
  // ==========================================

  const totalBattles = state.battles.length;
  const wins = state.battles.filter(b => b.result === 'win').length;
  const winRate = totalBattles > 0 ? Math.round((wins / totalBattles) * 100) : 0;

  const getPokemonUsageStats = () => {
    const stats: { [key: string]: { appearances: number; wins: number; loss: number } } = {};
    state.pokemon.forEach(p => {
      if (p) {
        stats[p.id] = { appearances: 0, wins: 0, loss: 0 };
      }
    });

    state.battles.forEach(b => {
      b.mySelected.forEach(pId => {
        if (stats[pId] !== undefined) {
          stats[pId].appearances += 1;
          if (b.result === 'win') {
            stats[pId].wins += 1;
          } else {
            stats[pId].loss += 1;
          }
        }
      });
    });

    return stats;
  };

  const pokemonUsageStats = getPokemonUsageStats();

  const getOpponentOccurrences = () => {
    const occ: { [key: string]: { seen: number; wins: number; losses: number } } = {};
    state.battles.forEach(b => {
      b.opponentParty.forEach(op => {
        if (!op.trim()) return;
        const normalized = op.trim();
        if (!occ[normalized]) {
          occ[normalized] = { seen: 0, wins: 0, losses: 0 };
        }
        occ[normalized].seen += 1;
        if (b.result === 'win') occ[normalized].wins += 1;
        else occ[normalized].losses += 1;
      });
    });
    return Object.entries(occ).sort((a, b) => b[1].seen - a[1].seen);
  };

  const opponentFrequency = getOpponentOccurrences();

  const getPokemonIndexForPhase = (phaseId: number): number[] => {
    if (phaseId === 2) return [0];
    if (phaseId === 3) return [1, 2];
    if (phaseId === 4) return [3, 4];
    if (phaseId === 5) return [5];
    return [];
  };

  // Next.js Safety: Render loader while client mounting
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-medium">ポケモン構築スタジオを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* GLOBAL HEADER */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-wrap justify-between items-center gap-4 sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-indigo-500 to-violet-500 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-violet-400 bg-clip-text text-transparent">
              ポケモン構築スタジオ <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 font-semibold ml-2">PRO VERSION</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">論理的なパーティ構築と戦績統計ダッシュボード</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={copyPartyToClipboard}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-bold rounded-lg border border-slate-700 transition"
            title="パーティの詳細情報をマークダウン形式等でコピー"
          >
            <Clipboard className="w-3.5 h-3.5 text-indigo-400" />
            構築を出力
          </button>
          
          <button 
            onClick={exportData}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-bold rounded-lg border border-slate-700 transition"
            title="構築データをJSONでダウンロード"
          >
            <Download className="w-3.5 h-3.5" />
            エクスポート
          </button>

          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-bold rounded-lg border border-slate-700 transition cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            インポート
            <input type="file" accept=".json" onChange={importData} className="hidden" />
          </label>

          <button 
            onClick={resetAllData}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-red-950/40 hover:bg-red-900/40 text-xs text-red-300 font-bold rounded-lg border border-red-800/50 transition ml-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            初期化
          </button>
        </div>
      </header>

      {/* NOTIFICATION TOAST */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl border transition-all transform scale-100 ${
          notification.type === 'error' ? 'bg-red-900/90 border-red-700 text-red-100' :
          notification.type === 'info' ? 'bg-slate-900/90 border-slate-700 text-slate-100' :
          'bg-indigo-900/90 border-indigo-700 text-indigo-100'
        }`}>
          <Info className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-semibold">{notification.text}</span>
        </div>
      )}

      {/* MAIN LAYOUT */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* ==========================================
            LEFT SIDEBAR: CURRENT PARTY & TYPE MAP
            ========================================== */}
        <aside className="w-full lg:w-72 bg-slate-900/50 p-4 lg:border-l border-slate-800 overflow-y-auto space-y-6">
          
          <div>
            <h2 className="text-xs font-extrabold tracking-wide text-slate-400 uppercase flex items-center gap-1.5 mb-3">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              構築フェーズ・コンパス
            </h2>
            <div className="space-y-1.5">
              {PHASES.map((p) => {
                const isActive = state.currentPhase === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handlePhaseChange(p.id)}
                    className={`w-full flex items-center justify-between text-left p-2.5 rounded-lg border transition ${
                      isActive 
                        ? 'bg-indigo-600/20 border-indigo-500/70 text-indigo-300 shadow-lg shadow-indigo-600/5' 
                        : 'bg-slate-850 border-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <span className="text-xs font-bold block">{p.name}</span>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 text-indigo-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
            <div>
              <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider block mb-0.5">CHECKLIST</span>
              <h3 className="text-xs font-bold text-slate-200">
                現フェーズの思考チェックリスト
              </h3>
            </div>
            
            <div className="space-y-2">
              {CHECKLIST_ITEMS[state.currentPhase]?.map((item) => {
                const checked = state.checklists[item.id] || false;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleChecklistToggle(item.id)}
                    className="flex items-start gap-2.5 cursor-pointer group p-1 rounded hover:bg-slate-800/40 transition"
                  >
                    <div className={`mt-0.5 w-4 h-4 flex-shrink-0 rounded border flex items-center justify-center transition-colors ${
                      checked 
                        ? 'bg-indigo-600 border-indigo-500 text-white' 
                        : 'bg-slate-900 border-slate-700 group-hover:border-indigo-400'
                    }`}>
                      {checked && <Check className="w-3 h-3" />}
                    </div>
                    <span className={`text-[11px] leading-relaxed select-none transition-all ${
                      checked ? 'text-slate-500 line-through' : 'text-slate-300'
                    }`}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800 text-[10px] text-slate-400 leading-relaxed mt-2">
              <span className="font-bold text-slate-300 block mb-0.5">💡 プロのアドバイス</span>
              {state.currentPhase === 1 && "環境にいる強敵を想定しない構築は、1匹選出の段階で崩壊しがちです。まずはしっかりと弱点を受けられる軸を考えましょう。"}
              {state.currentPhase === 2 && "1匹目の「エース/軸」は選出画面で最も圧力を与えます。技範囲と耐久の絶妙な調整意図をメモに書くのが重要です。"}
              {state.currentPhase === 3 && "基本選出「3匹」を確定させましょう。相手のプランをいなしてこちらのプランAを通せる3匹が完成度を左右します。"}
              {state.currentPhase === 4 && "基本選出が通らない『裏選出（対面重視、受けループ殺しなど）』の勝ち筋を作ると、一気に対戦対応力が向上します。"}
              {state.currentPhase === 5 && "ラストピースには「ここまででカバーしきれなかった特定のギミックやメタ（あくびループ、毒びし回収など）」対策が有効。"}
              {state.currentPhase === 6 && "勝敗結果には必ず敗因が存在します。『ステロで崩された』『素早さが足りなかった』など蓄積した敗因が変更方針のトリガーです。"}
              {state.currentPhase === 7 && "変更ログに交代理由と言語化した弱点を残すことで、一過性の感情による『迷走交代』を防ぐことができます。"}
            </div>
          </div>

          <div className="bg-indigo-950/20 border border-indigo-900/50 rounded-xl p-3 text-[11px] text-indigo-300 leading-relaxed">
            <span className="font-bold block mb-1">📝 Markdown形式で保存</span>
            <p className="text-[10px] text-slate-400">
              画面右上の「構築を出力」ボタンをクリックすると、外部ツールやブログ、SNSに投稿しやすいように整えられたテキストがクリップボードに自動的にコピーされます。
            </p>
          </div>

        </aside>

        {/* ==========================================
            MIDDLE MAIN CONTENT: DYNAMIC FORMS BY PHASE
            ========================================== */}
        <main className="flex-1 bg-slate-900 border-r border-slate-800 p-6 overflow-y-auto">
          
          <div className="mb-6 bg-slate-800/30 p-4 rounded-xl border border-slate-800 flex flex-wrap justify-between items-center gap-4">
            <div>
              <span className="text-xs font-semibold text-indigo-400 block mb-1">PRO-BUILDING WORKFLOW</span>
              <h2 className="text-xl font-bold flex items-center gap-2">
                {PHASES.find(p => p.id === state.currentPhase)?.name}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {PHASES.find(p => p.id === state.currentPhase)?.description}
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => state.currentPhase > 1 && handlePhaseChange(state.currentPhase - 1)}
                disabled={state.currentPhase === 1}
                className="px-3 py-1.5 text-xs font-bold border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                前へ
              </button>
              <button 
                onClick={() => state.currentPhase < 7 && handlePhaseChange(state.currentPhase + 1)}
                disabled={state.currentPhase === 7}
                className="px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                次へ
              </button>
            </div>
          </div>

          {/* ==================== PHASE 1: ENVIRONMENT ANALYSIS ==================== */}
          {state.currentPhase === 1 && (
            <div className="space-y-6">
              <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-700 pb-2">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-md font-bold">基本コンセプトの策定</h3>
                </div>
                
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">1. 構築のコアとなるコンセプト・コンセプト名</label>
                  <input
                    type="text"
                    value={state.environment.concept}
                    onChange={(e) => handleEnvUpdate('concept', e.target.value)}
                    placeholder="例: 对面寄りステルスロック展開、ゴツメサイクル等..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">2. 勝ち筋・構築の詳細解説</label>
                  <textarea
                    rows={4}
                    value={state.environment.conceptDetails}
                    onChange={(e) => handleEnvUpdate('conceptDetails', e.target.value)}
                    placeholder="どのように有利対面を作って削るか、勝ちパターンのプランA、プランBなどを言語化して記録します。"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                  <div className="flex items-center gap-2">
                    <TriangleAlert className="w-5 h-5 text-amber-400" />
                    <h3 className="text-md font-bold">環境のメタターゲット（対策必須ポケモン）</h3>
                  </div>
                  <button
                    onClick={handleAddThreat}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> ターゲットを追加
                  </button>
                </div>

                {state.environment.threats.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">ターゲットが追加されていません。環境の脅威を追加してください。</p>
                ) : (
                  <div className="space-y-4">
                    {state.environment.threats.map((threat) => (
                      <div key={threat.id} className="bg-slate-900 p-4 rounded-xl border border-slate-850 space-y-3 relative group">
                        <button
                          onClick={() => handleDeleteThreat(threat.id)}
                          className="absolute top-4 right-4 text-slate-500 hover:text-red-400 transition"
                          title="削除"
                        >
                          <Trash className="w-4 h-4" />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-1">仮想敵ポケモン名</label>
                            <input
                              type="text"
                              value={threat.name}
                              onChange={(e) => handleUpdateThreat(threat.id, 'name', e.target.value)}
                              placeholder="例: ハバタクカミ"
                              className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-1">警戒すべき型や技</label>
                            <input
                              type="text"
                              value={threat.dangerousMoves}
                              onChange={(e) => handleUpdateThreat(threat.id, 'dangerousMoves', e.target.value)}
                              placeholder="例: 電磁波 / ブーストエナジー型"
                              className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                          <div className="pr-8">
                            <label className="text-[10px] font-bold text-slate-400 block mb-1">自軍での具体的な対策案</label>
                            <input
                              type="text"
                              value={threat.countermeasures}
                              onChange={(e) => handleUpdateThreat(threat.id, 'countermeasures', e.target.value)}
                              placeholder="例: サーフゴーで電磁波をすかす"
                              className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== PHASES 2 to 5: POKEMON SELECTION ==================== */}
          {[2, 3, 4, 5].includes(state.currentPhase) && (
            <div className="space-y-6">
              
              <div className="bg-indigo-950/20 border border-indigo-900/50 rounded-2xl p-4">
                <h3 className="text-xs font-extrabold text-indigo-300 tracking-wider uppercase mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  クイックポケモンプリセット (即時読み込み)
                </h3>
                <p className="text-[10px] text-slate-400 mb-3 leading-relaxed">
                  主要な対戦実績ポケモンの中からワンクリックで、タイプ、特性、基本性格、調整努力値、技構成を適用できます。
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_POKEMON.map(p => (
                    <button
                      key={p.name}
                      onClick={() => {
                        const targetSlot = activeSlot !== null ? activeSlot : getPokemonIndexForPhase(state.currentPhase)[0];
                        loadPreset(targetSlot, p.name);
                      }}
                      className="text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded border border-slate-700 hover:border-indigo-500/50 transition flex items-center gap-1"
                    >
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 border-b border-slate-800 pb-2">
                {getPokemonIndexForPhase(state.currentPhase).map(idx => {
                  const p = state.pokemon[idx];
                  const isActive = activeSlot === idx || (activeSlot === null && getPokemonIndexForPhase(state.currentPhase)[0] === idx);
                  if (isActive && activeSlot === null) {
                    setTimeout(() => setActiveSlot(idx), 0);
                  }
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveSlot(idx)}
                      className={`px-4 py-2 rounded-t-lg font-bold text-xs transition border-t border-x ${
                        isActive 
                          ? 'bg-slate-800 border-indigo-500 text-indigo-300' 
                          : 'bg-slate-900/40 border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      #{idx + 1}枠目: {p ? p.name : "(未設定)"}
                    </button>
                  );
                })}
              </div>

              {activeSlot !== null && getPokemonIndexForPhase(state.currentPhase).includes(activeSlot) && (() => {
                const p = state.pokemon[activeSlot];
                
                if (!p) {
                  return (
                    <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-slate-900 mx-auto flex items-center justify-center border border-slate-700 text-slate-400">
                        <Plus className="w-8 h-8" />
                      </div>
                      <div className="max-w-md mx-auto">
                        <h4 className="text-md font-bold text-slate-200">#{activeSlot + 1}枠目のポケモンを追加</h4>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          ポケモンを手動で入力するか、上記の「クイックプリセット」からお気に入りの一匹を選んでロードしてください。
                        </p>
                      </div>
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            const initialPoke: PokemonData = {
                              id: crypto.randomUUID(),
                              name: "新しいポケモン",
                              type1: "normal",
                              type2: "none",
                              ability: "",
                              item: "",
                              moves: ["", "", "", ""],
                              nature: "まじめ (補正なし)",
                              effortValues: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
                              role: "エース",
                              description: ""
                            };
                            handlePokemonUpdate(activeSlot, initialPoke);
                          }}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold rounded-lg transition"
                        >
                          手動で新規作成
                        </button>
                      </div>
                    </div>
                  );
                }

                const speciesStats = BASE_SPECIES_STATS[p.name] || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
                const evSum = p.effortValues.hp + p.effortValues.atk + p.effortValues.def + p.effortValues.spa + p.effortValues.spd + p.effortValues.spe;

                return (
                  <div className="bg-slate-850 p-6 rounded-2xl border border-slate-750 space-y-6">
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-xs font-semibold text-slate-400 block mb-1">ポケモン名</label>
                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) => {
                            const newName = e.target.value;
                            const hasDbStats = BASE_SPECIES_STATS[newName];
                            handlePokemonUpdate(activeSlot, {
                              ...p,
                              name: newName,
                              ...(hasDbStats ? {
                                type1: PRESET_POKEMON.find(pr => pr.name === newName)?.type1 || p.type1,
                                type2: PRESET_POKEMON.find(pr => pr.name === newName)?.type2 || p.type2,
                              } : {})
                            });
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-100 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-400 block mb-1">タイプ 1</label>
                        <select
                          value={p.type1}
                          onChange={(e) => handlePokemonUpdate(activeSlot, { ...p, type1: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none"
                        >
                          {Object.entries(TYPES).map(([k, t]) => (
                            <option key={k} value={k}>{t.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-400 block mb-1">タイプ 2</label>
                        <select
                          value={p.type2}
                          onChange={(e) => handlePokemonUpdate(activeSlot, { ...p, type2: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none"
                        >
                          <option value="none">なし</option>
                          {Object.entries(TYPES).filter(([k]) => k !== 'none').map(([k, t]) => (
                            <option key={k} value={k}>{t.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-400 block mb-1">特性</label>
                        <input
                          type="text"
                          value={p.ability}
                          onChange={(e) => handlePokemonUpdate(activeSlot, { ...p, ability: e.target.value })}
                          placeholder="特性名"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-400 block mb-1">持ち物</label>
                        <input
                          type="text"
                           value={p.item}
                          onChange={(e) => handlePokemonUpdate(activeSlot, { ...p, item: e.target.value })}
                          placeholder="持ち物"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-400 block mb-1">性格</label>
                        <select
                          value={p.nature}
                          onChange={(e) => handlePokemonUpdate(activeSlot, { ...p, nature: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                        >
                          {NATURES.map(n => (
                            <option key={n.name} value={n.name}>{n.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-400 block mb-1">自陣での役割</label>
                        <select
                          value={p.role}
                          onChange={(e) => handlePokemonUpdate(activeSlot, { ...p, role: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                        >
                          <option value="エース">エース（主軸アタッカー）</option>
                          <option value="スイーパー">スイーパー（終盤一掃）</option>
                          <option value="クッション">クッション（サイクル・受け流し）</option>
                          <option value="起点作成">起点作成（先発荒らし・ステロ等）</option>
                          <option value="崩し枠">崩し枠（受けループ・耐久構築メタ）</option>
                          <option value="補完・ストッパー">補完・ストッパー（カウンターなど）</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-semibold text-slate-400 block mb-1.5">技構成 (最大4つ)</span>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {p.moves.map((move, mIdx) => (
                          <input
                            key={mIdx}
                            type="text"
                            value={move}
                            onChange={(e) => {
                              const newMoves = [...p.moves];
                              newMoves[mIdx] = e.target.value;
                              handlePokemonUpdate(activeSlot, { ...p, moves: newMoves });
                            }}
                            placeholder={`技 ${mIdx + 1}`}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                          />
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-extrabold text-indigo-400 flex items-center gap-1">
                          <BarChart className="w-3.5 h-3.5" />
                          努力値・実数値計算機 (Lv50想定・個体値31固定)
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-400">努力値合計: </span>
                          <span className={`text-xs font-bold ${evSum > 510 ? 'text-red-400' : 'text-emerald-400'}`}>
                            {evSum} / 510
                          </span>
                          {evSum > 510 && <TriangleAlert className="w-3 text-red-400" title="上限突破しています！" />}
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        {(['hp', 'atk', 'def', 'spa', 'spd', 'spe'] as (keyof BaseStats)[]).map((statName) => {
                          const labels: { [key: string]: string } = { hp: 'H (HP)', atk: 'A (攻撃)', def: 'B (防御)', spa: 'C (特攻)', spd: 'D (特防)', spe: 'S (素早)' };
                          const base = speciesStats[statName] || 0;
                          const ev = p.effortValues[statName] || 0;
                          const calculatedVal = calculateStat(statName, base, ev, p.nature);
                          const natureObj = NATURES.find(n => n.name === p.nature);

                          const isUp = natureObj?.up === statName;
                          const isDown = natureObj?.down === statName;

                          return (
                            <div key={statName} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-850 p-2 rounded-lg text-xs">
                              <div className="w-20 flex-shrink-0 flex items-center gap-1 font-bold">
                                <span className="text-slate-200">{labels[statName]}</span>
                                {isUp && <span className="text-[9px] text-red-400 font-extrabold">▲</span>}
                                {isDown && <span className="text-[9px] text-blue-400 font-extrabold">▼</span>}
                              </div>

                              <div className="w-14 text-slate-400 text-[10px]">
                                種族値: <span className="font-semibold text-slate-300">{base || '?'}</span>
                              </div>

                              <div className="flex-1 flex items-center gap-2">
                                <input
                                  type="range"
                                  min={0}
                                  max={252}
                                  step={4}
                                  value={ev}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    const newEvs = { ...p.effortValues, [statName]: val };
                                    handlePokemonUpdate(activeSlot, { ...p, effortValues: newEvs });
                                  }}
                                  className="flex-1 accent-indigo-500 h-1 bg-slate-700 rounded-lg cursor-pointer"
                                />
                                <input
                                  type="number"
                                  min={0}
                                  max={252}
                                  value={ev}
                                  onChange={(e) => {
                                    let val = parseInt(e.target.value) || 0;
                                    if (val > 252) val = 252;
                                    const newEvs = { ...p.effortValues, [statName]: val };
                                    handlePokemonUpdate(activeSlot, { ...p, effortValues: newEvs });
                                  }}
                                  className="w-12 text-center bg-slate-900 border border-slate-750 rounded px-1 py-0.5 text-xs"
                                />
                              </div>

                              <div className="w-20 text-right font-extrabold text-indigo-300">
                                実数値: {base ? calculatedVal : "-"}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-400 block mb-1">調整意図・採用詳細メモ</label>
                      <textarea
                        rows={3}
                        value={p.description}
                        onChange={(e) => handlePokemonUpdate(activeSlot, { ...p, description: e.target.value })}
                        placeholder="例: Sは最速〇〇抜き、Aはこだわりハチマキ補正で特化〇〇を確1などの意図を書き込みます。"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="flex justify-between items-center border-t border-slate-750 pt-4">
                      <span className="text-[10px] text-slate-500">変更は自動でセーブされています。</span>
                      <button
                        onClick={() => clearPokemonSlot(activeSlot)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-950/20 hover:bg-red-900/30 text-red-300 font-bold text-xs rounded-lg border border-red-800/40 transition"
                      >
                        <Trash className="w-3.5 h-3.5" />
                        この枠をクリア
                      </button>
                    </div>

                  </div>
                );
              })()}

            </div>
          )}

          {/* ==================== PHASE 6: BATTLE RECORDS (戦績分析) ==================== */}
          {state.currentPhase === 6 && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase">通算バトル勝率</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-black text-indigo-400">{winRate}%</span>
                    <span className="text-xs text-slate-400">({wins}勝 {totalBattles - wins}敗)</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 mt-3">
                    <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${winRate}%` }}></div>
                  </div>
                </div>

                <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between col-span-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">各ポケモンの選出・勝率スタッツ</span>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {state.pokemon.map((p) => {
                      if (!p) return null;
                      const usage = pokemonUsageStats[p.id] || { appearances: 0, wins: 0, loss: 0 };
                      const selectionRate = totalBattles > 0 ? Math.round((usage.appearances / totalBattles) * 100) : 0;
                      const pokeWinRate = usage.appearances > 0 ? Math.round((usage.wins / usage.appearances) * 100) : 0;
                      
                      return (
                        <div key={p.id} className="bg-slate-900 p-2 rounded-lg text-center border border-slate-800">
                          <span className="text-[10px] font-extrabold text-indigo-300 block truncate">{p.name}</span>
                          <div className="flex justify-center gap-1.5 mt-1 text-[10px]">
                            <span>選出率: <b className="text-slate-200">{selectionRate}%</b></span>
                            <span>勝率: <b className="text-emerald-400">{pokeWinRate}%</b></span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-md font-bold flex items-center gap-2 border-b border-slate-700 pb-2">
                  <ListPlus className="w-5 h-5 text-indigo-400" />
                  新しい対戦履歴を記録
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-slate-400 block mb-1">対戦日</label>
                        <input
                          type="date"
                          value={newBattle.date}
                          onChange={(e) => setNewBattle(prev => ({ ...prev, date: e.target.value }))}
                          className="w-full bg-slate-900 border border-slate-750 rounded-lg px-3 py-1.5 text-xs text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-400 block mb-1">結果</label>
                        <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-750">
                          <button
                            type="button"
                            onClick={() => setNewBattle(prev => ({ ...prev, result: 'win' }))}
                            className={`px-3 py-1 rounded text-xs font-bold transition ${newBattle.result === 'win' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                          >
                            WIN
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewBattle(prev => ({ ...prev, result: 'lose' }))}
                            className={`px-3 py-1 rounded text-xs font-bold transition ${newBattle.result === 'lose' ? 'bg-red-900 text-red-200' : 'text-slate-400 hover:text-slate-200'}`}
                          >
                            LOSE
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-400 block mb-1">自選出 (最大3匹、順に選択)</label>
                      <div className="grid grid-cols-6 gap-1">
                        {state.pokemon.map((p) => {
                          if (!p) return null;
                          const selectedIndex = newBattle.mySelected.indexOf(p.id);
                          const isSelected = selectedIndex !== -1;
                          
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setNewBattle(prev => ({
                                    ...prev,
                                    mySelected: prev.mySelected.filter(id => id !== p.id)
                                  }));
                                } else {
                                  if (newBattle.mySelected.length >= 3) {
                                    triggerNotification("選出できるのは3匹までです", "error");
                                    return;
                                  }
                                  setNewBattle(prev => ({
                                    ...prev,
                                    mySelected: [...prev.mySelected, p.id]
                                  }));
                                }
                              }}
                              className={`py-2 px-1 rounded border text-[10px] font-bold text-center flex flex-col items-center justify-between relative transition ${
                                isSelected 
                                  ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300' 
                                  : 'bg-slate-900 border-slate-750 text-slate-400'
                              }`}
                            >
                              {isSelected && (
                                <span className="absolute top-1 right-1 bg-indigo-500 text-white text-[8px] w-3 h-3 flex items-center justify-center rounded-full">
                                  {selectedIndex + 1}
                                </span>
                              )}
                              <span className="truncate w-full">{p.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">相手のポケモン6匹 (または判明分だけ)</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {newBattle.opponentParty.map((op, oIdx) => (
                        <input
                          key={`opp-${oIdx}`}
                          type="text"
                          value={op}
                          onChange={(e) => {
                            const newOpp = [...newBattle.opponentParty];
                            newOpp[oIdx] = e.target.value;
                            setNewBattle(prev => ({ ...prev, opponentParty: newOpp }));
                          }}
                          placeholder={`相手 ${oIdx + 1}`}
                          className="bg-slate-900 border border-slate-750 rounded px-2 py-1.5 text-xs text-slate-100"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">勝因・敗因</label>
                    <textarea
                      rows={2}
                      value={newBattle.causeOfWinLose}
                      onChange={(e) => setNewBattle(prev => ({ ...prev, causeOfWinLose: e.target.value }))}
                      placeholder="例: 初手の出し勝ちから押し切れた、相手のステルスロックが重すぎた..."
                      className="w-full bg-slate-900 border border-slate-750 rounded-lg px-3 py-1.5 text-xs text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">今後の課題・メモ・反省</label>
                    <textarea
                      rows={2}
                      value={newBattle.reflection}
                      onChange={(e) => setNewBattle(prev => ({ ...prev, reflection: e.target.value }))}
                      placeholder="例: サーフゴーの引きタイミングを早くする、ラムの実を持たせるか検討..."
                      className="w-full bg-slate-900 border border-slate-750 rounded-lg px-3 py-1.5 text-xs text-slate-100"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleAddBattle}
                    className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold rounded-lg text-white transition shadow-lg shadow-indigo-600/20"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    戦績を記録する
                  </button>
                </div>
              </div>

              <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-800">
                <h3 className="text-xs font-extrabold tracking-wider text-slate-400 uppercase mb-3">
                  頻出する相手のポケモンと対抗成績
                </h3>
                {opponentFrequency.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">戦績が記録されると、警戒ターゲットごとの個別勝率スタッツがここに表示されます。</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {opponentFrequency.slice(0, 10).map(([name, data]) => {
                      const opWinRate = Math.round((data.losses / data.seen) * 100);
                      return (
                        <div key={`freq-${name}`} className="bg-slate-900 p-2.5 rounded-lg border border-slate-850">
                          <span className="text-xs font-bold text-slate-200 block truncate">{name}</span>
                          <div className="flex justify-between items-center mt-1 text-[10px]">
                            <span className="text-slate-400">対戦回数: {data.seen}</span>
                            <span className={`font-bold ${opWinRate >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>
                              勝率 {opWinRate}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-400">バトル履歴 ({totalBattles}件)</h3>
                {state.battles.length === 0 ? (
                  <p className="text-xs text-slate-500 italic bg-slate-900/30 p-4 rounded-xl border border-slate-850 text-center">対戦履歴がありません。上のフォームから記録してください。</p>
                ) : (
                  state.battles.map((b) => (
                    <div key={b.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${b.result === 'win' ? 'bg-indigo-600/20 text-indigo-300' : 'bg-red-950 text-red-300'}`}>
                            {b.result === 'win' ? '勝利' : '敗北'}
                          </span>
                          <span className="text-[10px] text-slate-400">{b.date}</span>
                        </div>

                        <div className="flex gap-1.5 items-center">
                          <span className="text-[10px] text-slate-400 font-semibold">自選出:</span>
                          <div className="flex gap-1">
                            {b.mySelected.map(id => {
                              const p = state.pokemon.find(poke => poke?.id === id);
                              return p ? (
                                <span key={id} className="text-[9px] bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-slate-300">
                                  {p.name}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>

                        <div className="flex gap-1.5 items-center flex-wrap">
                          <span className="text-[10px] text-slate-400 font-semibold">相手選出:</span>
                          <div className="flex gap-1 flex-wrap">
                            {b.opponentParty.map((op, oIdx) => (
                              <span key={`rec-${oIdx}-${op}`} className="text-[9px] bg-slate-800/50 px-1.5 py-0.5 rounded text-slate-400 border border-slate-850">
                                {op}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-2 rounded-lg border border-slate-850">
                          <p><b className="text-slate-400">勝敗因:</b> {b.causeOfWinLose || '未入力'}</p>
                          <p className="mt-1"><b className="text-slate-400">今後の反省:</b> {b.reflection || '未入力'}</p>
                        </div>
                      </div>

                      <div className="flex md:flex-col justify-end items-end">
                        <button
                          onClick={() => handleDeleteBattle(b.id)}
                          className="text-slate-500 hover:text-red-400 transition p-1"
                          title="削除"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* ==================== PHASE 7: CHANGE LOG ==================== */}
          {state.currentPhase === 7 && (
            <div className="space-y-6">
              
              <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-md font-bold flex items-center gap-2 border-b border-slate-700 pb-2">
                  <RefreshCw className="w-5 h-5 text-indigo-400" />
                  メンバー・型変更の登録
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">離脱したポケモン (OUT)</label>
                    <input
                      type="text"
                      value={newLog.pokemonOut}
                      onChange={(e) => setNewLog(prev => ({ ...prev, pokemonOut: e.target.value }))}
                      placeholder="例: イーユイ (または技の変更等)"
                      className="w-full bg-slate-900 border border-slate-750 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">加入したポケモン (IN)</label>
                    <input
                      type="text"
                      value={newLog.pokemonIn}
                      onChange={(e) => setNewLog(prev => ({ ...prev, pokemonIn: e.target.value }))}
                      placeholder="例: アシレーヌ"
                      className="w-full bg-slate-900 border border-slate-750 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">変更日付</label>
                    <input
                      type="date"
                      value={newLog.date}
                      onChange={(e) => setNewLog(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-750 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">交代・調整変更の明確な理由・メタ対象</label>
                  <textarea
                    rows={3}
                    value={newLog.reason}
                    onChange={(e) => setNewLog(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="例: 特殊アタッカーが不足していた。また相手の炎オーガポンへの受け・崩し枠として相性補完を重視して交代。"
                    className="w-full bg-slate-900 border border-slate-750 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleAddChangeLog}
                    className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold rounded-lg text-white transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    交代ログを記録
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-400">変更履歴一覧 ({state.changeLogs.length}件)</h3>
                {state.changeLogs.length === 0 ? (
                  <p className="text-xs text-slate-500 italic bg-slate-900/30 p-4 rounded-xl border border-slate-850 text-center">ログがありません。構築の迷走を防ぐために、交代理由などを書き残しておきましょう。</p>
                ) : (
                  state.changeLogs.map((log) => (
                    <div key={log.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between gap-4 items-start">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-bold">{log.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-red-400 font-bold line-through">{log.pokemonOut}</span>
                          <ChevronRight className="w-3 h-3 text-slate-500" />
                          <span className="text-emerald-400 font-bold">{log.pokemonIn}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed pt-1">
                          <b className="text-slate-400 block mb-0.5">変更意図:</b>
                          {log.reason}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteChangeLog(log.id)}
                        className="text-slate-500 hover:text-red-400 transition"
                        title="削除"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

        </main>

        {/* ==========================================
            RIGHT SIDEBAR: ACTIVE COMPASS & CHECKLISTS
            ========================================== */}
        <aside className="w-full lg:w-80 bg-slate-900/70 lg:border-r border-slate-800 flex flex-col max-h-screen overflow-y-auto">
          
          <div className="p-4 border-b border-slate-800">
            <h2 className="text-sm font-extrabold tracking-wide text-slate-400 uppercase flex items-center gap-1.5 mb-3">
              <Layers className="w-4 h-4 text-indigo-400" />
              現在のパーティメンバー
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {state.pokemon.map((p, idx) => {
                const active = activeSlot === idx;
                return p ? (
                  <div
                    key={p.id}
                    onClick={() => {
                      const targetPhase = idx === 0 ? 2 : (idx <= 2 ? 3 : (idx <= 4 ? 4 : 5));
                      handlePhaseChange(targetPhase);
                      setActiveSlot(idx);
                    }}
                    className={`cursor-pointer group flex flex-col items-center p-2 rounded-lg border transition text-center relative ${
                      active 
                        ? 'bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500' 
                        : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/60'
                    }`}
                  >
                    <div className="absolute top-1 left-1.5 text-[9px] font-bold text-slate-500 group-hover:text-indigo-400">
                      #{idx + 1}
                    </div>
                    
                    <div className="w-10 h-10 mt-1 rounded-full flex items-center justify-center bg-slate-900 font-extrabold text-sm border border-slate-700 text-slate-300">
                      {p.name.slice(0, 2)}
                    </div>
                    
                    <div className="text-[10px] font-bold mt-1 text-slate-200 truncate w-full">
                      {p.name}
                    </div>

                    <div className="flex justify-center gap-0.5 mt-1 w-full overflow-hidden">
                      <span className={`w-1.5 h-1.5 rounded-full ${TYPES[p.type1]?.bg}`} title={getTypeNameJP(p.type1)}></span>
                      {p.type2 && p.type2 !== 'none' && (
                        <span className={`w-1.5 h-1.5 rounded-full ${TYPES[p.type2]?.bg}`} title={getTypeNameJP(p.type2)}></span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    key={idx}
                    onClick={() => {
                      const targetPhase = idx === 0 ? 2 : (idx <= 2 ? 3 : (idx <= 4 ? 4 : 5));
                      handlePhaseChange(targetPhase);
                      setActiveSlot(idx);
                    }}
                    className="cursor-pointer flex flex-col items-center justify-center p-2 rounded-lg border border-dashed border-slate-800 hover:border-slate-700 hover:bg-slate-800/30 bg-slate-900/30 h-[72px] text-slate-600 hover:text-slate-400 transition"
                  >
                    <span className="text-[9px] font-bold text-slate-600 block mb-1">#{idx + 1}</span>
                    <Plus className="w-4 h-4" />
                    <span className="text-[9px] font-bold mt-1">追加</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 flex-1">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-sm font-extrabold tracking-wide text-slate-400 uppercase flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-400" />
                タイプ相性バランス分析
              </h2>
              <div className="group relative">
                <CircleHelp className="w-3.5 h-3.5 text-slate-500 cursor-pointer hover:text-indigo-400" />
                <div className="hidden group-hover:block absolute left-full top-0 ml-2 w-52 p-2 bg-slate-800 text-[10px] rounded-lg border border-slate-700 shadow-xl z-50 text-slate-300">
                  各属性の攻撃を受けた際、パーティ全員の耐性を集計。弱点（2倍・4倍）と耐性（0.5倍以下・無効）の偏りを可視化します。
                </div>
              </div>
            </div>

            {activePokemonCount === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">ポケモンを登録すると、自動的に耐性のバランスや偏りが出力されます。</p>
            ) : (
              <div className="space-y-3">
                
                {vulnerableTypes.length > 0 ? (
                  <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-3">
                    <div className="flex items-start gap-1.5 text-red-400 mb-1">
                      <TriangleAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span className="text-xs font-bold">要確認・弱点一貫性アリ</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mb-2 leading-relaxed">
                      以下のタイプ攻撃に耐性のあるポケモンが極端に少ないか、弱点が被っています。交代を検討するか、補完枠で調整してください。
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {vulnerableTypes.map(vt => (
                        <span key={vt} className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white ${TYPES[vt]?.bg}`}>
                          {getTypeNameJP(vt)}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-xl p-3 flex items-center gap-2">
                    <CircleCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-emerald-400 block">相性補完良好</span>
                      <span className="text-[10px] text-slate-400">極端な一貫性や、対応不能な弱点の重複はみられません！</span>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                  {Object.entries(typeAnalysis).map(([typeKey, data]) => {
                    const diff = data.weaknessCount - (data.resistanceCount + data.immuneCount);
                    
                    return (
                      <div key={typeKey} className="flex items-center justify-between text-xs p-1.5 rounded hover:bg-slate-800/40 transition">
                        <div className="w-16 flex-shrink-0 flex items-center">
                          <span className={`w-14 text-center text-[10px] font-bold py-0.5 rounded text-white ${TYPES[typeKey]?.bg} shadow-sm`}>
                            {getTypeNameJP(typeKey)}
                          </span>
                        </div>

                        <div className="flex-1 mx-3 flex items-center gap-1.5">
                          <div className="flex items-center gap-0.5">
                            <span className="text-[9px] text-red-400 font-bold w-2">{data.weaknessCount}</span>
                            <div className="flex gap-0.5">
                              {Array.from({ length: data.weaknessCount }).map((_, i) => (
                                <span key={i} className="w-1.5 h-1.5 rounded-full bg-red-500" title={`弱点: ${data.pokemonWeak.join(', ')}`}></span>
                              ))}
                            </div>
                          </div>

                          <div className="text-slate-600 text-[10px]">|</div>

                          <div className="flex items-center gap-0.5">
                            <span className="text-[9px] text-emerald-400 font-bold w-2">
                              {data.resistanceCount + data.immuneCount}
                            </span>
                            <div className="flex gap-0.5">
                              {Array.from({ length: data.resistanceCount }).map((_, i) => (
                                <span key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-500" title={`耐性: ${data.pokemonResist.join(', ')}`}></span>
                              ))}
                              {Array.from({ length: data.immuneCount }).map((_, i) => (
                                <span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-300 border border-slate-400" title={`無効: ${data.pokemonResist.join(', ')}`}></span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="w-10 text-right">
                          {diff > 0 ? (
                            <span className="text-[10px] font-bold text-red-400">不利</span>
                          ) : (data.resistanceCount + data.immuneCount) >= 2 ? (
                            <span className="text-[10px] font-bold text-emerald-400">盤石</span>
                          ) : (
                            <span className="text-[10px] text-slate-500">標準</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            )}
          </div>
        </aside>
        

      </div>

      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-900 py-3 px-6 text-center text-[11px] text-slate-500">
        <p>© 2026 ポケモンパーティ構築スタジオ (Pokemon Team Builder Studio Pro). すべての対戦を言語化して極めよう。</p>
      </footer>

    </div>
  );
}