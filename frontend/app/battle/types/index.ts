// frontend/app/battle/types/index.ts

export type MatchResult = 'win' | 'lose' | 'draw' | null;

// 相手のポケモン1匹分の状態
export interface OpponentPokemon {
  id?: string;               // DB保存後に付与されるUUID
  base_pokemon_id: number;   // PokeAPIのID
  slot_order: number;        // 1〜6の配置順
  is_selected: boolean;      // 選出されたか
  is_fainted: boolean;       // ひんし状態か
  is_tera_used: boolean;     // テラスタルを切ったか
  is_mega_used: boolean;     // メガシンカしたか
  tera_type: string | null;  // 判明したテラスタイプ
  item_id: number | null;    // 判明した持ち物
  ability_id: number | null; // 判明した特性
  moves: number[];           // 判明した技リスト (最大4つ)
}

// 1試合の全体データ
export interface BattleMatch {
  id?: string;
  result: MatchResult;
  my_team: number[];         // 自分の選出ポケモンのID配列
  memo: string | null;
  opponent_pokemons: OpponentPokemon[];
}


export interface BattleAdviceRequest {
  my_party: string[];       // 自パーティ（6体）
  enemy_party: string[];    // 相手パーティ（6体）
  rule: 'single' | 'double';
  regulation: string;
}

export interface BattleAdviceResponse {
  recommended_selection: string[]; // 推奨選出（3体または4体）
  lead_pokemon: string;            // 初手（リード）
  reasons: string[];               // 選出理由（箇条書き）
  threats: string[];               // 警戒すべきポケモン・並び
  notes: string[];                 // 対戦時の注意点
}