export const LEVEL = 50;
export const INDIVIDUAL_VALUE = 31;
export const NATURES = [
    { name: "さみしがり (攻撃↑ 防御↓)", up: "A", down: "B" },
    { name: "いじっぱり (攻撃↑ 特攻↓)", up: "A", down: "C" },
    { name: "やんちゃ (攻撃↑ 特防↓)", up: "A", down: "D" },
    { name: "ゆうかん (攻撃↑ 素早↓)", up: "A", down: "S" },
    { name: "ずぶとい (防御↑ 攻撃↓)", up: "B", down: "A" },
    { name: "わんぱく (防御↑ 特攻↓)", up: "B", down: "C" },
    { name: "のうてんき (防御↑ 特防↓)", up: "B", down: "D" },
    { name: "のんき (防御↑ 素早↓)", up: "B", down: "S" },
    { name: "ひかえめ (特攻↑ 攻撃↓)", up: "C", down: "A" },
    { name: "おっとり (特攻↑ 防御↓)", up: "C", down: "B" },
    { name: "うっかりや (特攻↑ 特防↓)", up: "C", down: "D" },
    { name: "れいせい (特攻↑ 素早↓)", up: "C", down: "S" },
    { name: "おだやか (特防↑ 攻撃↓)", up: "D", down: "A" },
    { name: "おとなしい (特防↑ 防御↓)", up: "D", down: "B" },
    { name: "しんちょう (特防↑ 特攻↓)", up: "D", down: "C" },
    { name: "なまいき (特防↑ 素早↓)", up: "D", down: "S" },
    { name: "おくびょう (素早↑ 攻撃↓)", up: "S", down: "A" },
    { name: "せっかち (素早↑ 防御↓)", up: "S", down: "B" },
    { name: "ようき (素早↑ 特攻↓)", up: "S", down: "C" },
    { name: "むじゃき (素早↑ 特防↓)", up: "S", down: "D" },
    { name: "てれや (補正なし)", up: null, down: null },
    { name: "がんばりや (補正なし)", up: null, down: null },
    { name: "すなお (補正なし)", up: null, down: null },
    { name: "きまぐれ (補正なし)", up: null, down: null },
    { name: "まじめ (補正なし)", up: null, down: null },
];

export const TYPES: { [key: string]: { name: string; color: string; bg: string } } = {
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

export const PHASES = [
    { id: 1, name: "1. 環境分析", description: "ターゲット選定とコンセプト決定" },
    { id: 2, name: "2. 1匹目の採用", description: "構築の絶対的なエース・軸の選定" },
    { id: 3, name: "3. 2,3匹目の採用", description: "軸を支えるサイクル・相性補完" },
    { id: 4, name: "4,5匹目の採用", description: "裏の選出パターン・対応力の拡張" },
    { id: 5, name: "5. 6匹目の採用", description: "ラストピース・特定のメタ枠" },
    { id: 6, name: "6. 戦績分析", description: "バトルログ記録と勝率・選出率の可視化" },
    { id: 7, name: "7. 変更ログ", description: "試行錯誤の歴史を辿る" }
  ];