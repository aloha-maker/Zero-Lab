// frontend/features/candidate-screening/utils/typeMatchup.ts
// Reactに依存しない純粋関数群：タイプ名変換・相性判定のロジック

/** 日本語タイプ名 → 英語タイプ名（API用） */
export const TYPE_MAP_JA_TO_EN: { [key: string]: string } = {
  "ノーマル": "normal", "ほのお": "fire", "みず": "water", "でんき": "electric",
  "くさ": "grass", "こおり": "ice", "かくとう": "fighting", "どく": "poison",
  "じめん": "ground", "ひこう": "flying", "エスパー": "psychic", "むし": "bug",
  "いわ": "rock", "ゴースト": "ghost", "ドラゴン": "dragon", "あく": "dark",
  "はがね": "steel", "フェアリー": "fairy",
};

/** 日本語タイプ名の配列を英語タイプ名の配列に変換する */
export function toEnglishTypes(japaneseTypes: string[]): string[] {
  return japaneseTypes.map((t) => TYPE_MAP_JA_TO_EN[t] || t.toLowerCase());
}

/** 弱点重複判定：主軸の弱点タイプに対する倍率のいずれかが2.0以上か */
export function isWeaknessOverlapped(defenseMultipliers: number[]): boolean {
  return defenseMultipliers.some((m) => m >= 2.0);
}

/** 耐性補完判定：主軸の弱点タイプに対する倍率のいずれかが0.5以下か */
export function hasDefenseComplement(defenseMultipliers: number[]): boolean {
  return defenseMultipliers.some((m) => m <= 0.5);
}

/** 攻撃補完判定：いずれかの自タイプが等倍より高い打点を持つか */
export function hasAttackComplement(attackMultipliers: number[]): boolean {
  return attackMultipliers.some((m) => m > 1.0);
}
