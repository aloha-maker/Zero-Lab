// frontend/app/battle/store/useBattleStore.ts
import { create } from 'zustand';
import { OpponentPokemon, BattleMatch } from '../types';

interface BattleState {
  // --- State ---
  matchId: string | null;
  opponentTeam: OpponentPokemon[];
  isSyncing: boolean; // FastAPIとの通信中フラグ (☁️↻)
  syncError: boolean; // 通信エラーフラグ (☁️❌)
  editingSlot: number | null;// 🌟 追加: 現在詳細メモを開いているポケモンの枠番号

  // --- Actions ---
  // 初期化（パーティ入力画面で6匹を決定した時）
  initializeMatch: (matchId: string, pokemons: OpponentPokemon[]) => void;
  
  // バトル中のトグル操作（遅延ゼロでUIに反映）
  toggleSelected: (slotOrder: number) => void;
  toggleFainted: (slotOrder: number) => void;
  toggleTera: (slotOrder: number) => void;
  
  // 詳細メモの更新
  updatePokemonDetail: (slotOrder: number, updates: Partial<OpponentPokemon>) => void;
  
  // ドロワーの開閉アクション
  setEditingSlot: (slotOrder: number | null) => void;

  // FastAPIへのバックグラウンド同期
  syncToBackend: () => Promise<void>;
}

export const useBattleStore = create<BattleState>((set, get) => ({
  matchId: null,
  opponentTeam: [],
  isSyncing: false,
  syncError: false,
  editingSlot: null,

  initializeMatch: (matchId, pokemons) => set({ matchId, opponentTeam: pokemons, syncError: false }),

  toggleSelected: (slotOrder) => {
    set((state) => ({
      opponentTeam: state.opponentTeam.map((p) =>
        p.slot_order === slotOrder ? { ...p, is_selected: !p.is_selected } : p
      ),
    }));
    get().syncToBackend(); // 裏側で同期
  },

  toggleFainted: (slotOrder) => {
    set((state) => ({
      opponentTeam: state.opponentTeam.map((p) =>
        p.slot_order === slotOrder ? { ...p, is_fainted: !p.is_fainted } : p
      ),
    }));
    get().syncToBackend();
  },

  toggleTera: (slotOrder) => {
    set((state) => ({
      opponentTeam: state.opponentTeam.map((p) => {
        // テラスタルは1試合に1匹のみ（排他制御）
        if (p.slot_order === slotOrder) {
          return { ...p, is_tera_used: !p.is_tera_used };
        }
        return { ...p, is_tera_used: false };
      }),
    }));
    get().syncToBackend();
  },

  updatePokemonDetail: (slotOrder, updates) => {
    set((state) => ({
      opponentTeam: state.opponentTeam.map((p) =>
        p.slot_order === slotOrder ? { ...p, ...updates } : p
      ),
    }));
    get().syncToBackend();
  },

  setEditingSlot: (slotOrder) => set({ editingSlot: slotOrder }),

  syncToBackend: async () => {
    const { matchId, opponentTeam } = get();
    if (!matchId) return;

    set({ isSyncing: true, syncError: false });
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/battles/${matchId}/pokemons`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(opponentTeam),
      });
      
      if (!response.ok) throw new Error('Sync failed');
      
      set({ isSyncing: false });
    } catch (error) {
      console.error(error);
      set({ isSyncing: false, syncError: true });
    }
  },
}));