// frontend/app/battle/store/useBattleStore.ts
import { create } from 'zustand';
import { OpponentPokemon, BattleMatch } from '../types';
import type { PokemonBuildResponse } from '@/features/bulids/types';
import { API_URL } from '@/lib/api-client';
interface BattleState {
  // --- State ---
  matchId: string | null;
  opponentTeam: OpponentPokemon[];
  isSyncing: boolean;
  syncError: boolean;
  editingSlot: number | null;
  selectedPartyId: string | null;
  myPartyBuilds: PokemonBuildResponse[];
  /** 選択中のシーズンID */
  seasonId: number | null;
  /** 選択中のシーズンに紐づくルールID（ポケモン候補フィルタに使用） */
  ruleId: number | null;

  // --- Actions ---
  initializeMatch: (matchId: string, pokemons: OpponentPokemon[]) => void;

  toggleSelected: (slotOrder: number) => void;
  toggleFainted: (slotOrder: number) => void;
  toggleTera: (slotOrder: number) => void;
  toggleMega: (slotOrder: number) => void;

  updatePokemonDetail: (slotOrder: number, updates: Partial<OpponentPokemon>) => void;

  setEditingSlot: (slotOrder: number | null) => void;

  syncToBackend: () => Promise<void>;

  setSelectedParty: (partyId: string | null, builds: PokemonBuildResponse[]) => void;
  clearSelectedParty: () => void;

  /** シーズン選択時に seasonId と ruleId を同時にセット */
  setSeason: (seasonId: number | null, ruleId: number | null) => void;
}

export const useBattleStore = create<BattleState>((set, get) => ({
  matchId: null,
  opponentTeam: [],
  isSyncing: false,
  syncError: false,
  editingSlot: null,
  selectedPartyId: null,
  myPartyBuilds: [],
  seasonId: null,
  ruleId: null,

  initializeMatch: (matchId, pokemons) => set({ matchId, opponentTeam: pokemons, syncError: false }),

  toggleSelected: (slotOrder) => {
    set((state) => ({
      opponentTeam: state.opponentTeam.map((p) =>
        p.slot_order === slotOrder ? { ...p, is_selected: !p.is_selected } : p
      ),
    }));
    get().syncToBackend();
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
        if (p.slot_order === slotOrder) {
          return { ...p, is_tera_used: !p.is_tera_used };
        }
        return { ...p, is_tera_used: false };
      }),
    }));
    get().syncToBackend();
  },

  toggleMega: (slotOrder) =>
    set((state) => ({
      opponentTeam: state.opponentTeam.map((p) =>
        p.slot_order === slotOrder ? { ...p, is_mega_used: !p.is_mega_used } : p
      ),
    })),

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
      const response = await fetch(
        `${API_URL}/battles/${matchId}/pokemons`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(opponentTeam),
        }
      );

      if (!response.ok) throw new Error('Sync failed');

      set({ isSyncing: false });
    } catch (error) {
      console.error(error);
      set({ isSyncing: false, syncError: true });
    }
  },

  setSelectedParty: (partyId, builds) => set({
    selectedPartyId: partyId,
    myPartyBuilds: builds,
  }),

  clearSelectedParty: () => set({
    selectedPartyId: null,
    myPartyBuilds: [],
  }),

  setSeason: (seasonId, ruleId) => set({ seasonId, ruleId }),
}));