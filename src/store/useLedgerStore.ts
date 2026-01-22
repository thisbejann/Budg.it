import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Ledger } from '../types/database';
import { LedgerRepository } from '../database/repositories';

interface LedgerState {
  activeLedgerId: number | null;
  activeLedger: Ledger | null;
  ledgers: Ledger[];
  isLoading: boolean;

  // Actions
  setActiveLedger: (ledgerId: number) => Promise<void>;
  loadLedgers: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useLedgerStore = create<LedgerState>()(
  persist(
    (set, get) => ({
      activeLedgerId: null,
      activeLedger: null,
      ledgers: [],
      isLoading: true,

      setActiveLedger: async (ledgerId: number) => {
        const ledger = await LedgerRepository.getById(ledgerId);
        set({ activeLedgerId: ledgerId, activeLedger: ledger });
      },

      loadLedgers: async () => {
        const ledgers = await LedgerRepository.getAll();
        set({ ledgers });
      },

      initialize: async () => {
        set({ isLoading: true });
        try {
          // Check if any ledgers exist
          const hasLedgers = await LedgerRepository.hasAny();

          if (!hasLedgers) {
            // Create default ledger
            const defaultId = await LedgerRepository.createDefault('Personal');
            const ledger = await LedgerRepository.getById(defaultId);
            set({
              ledgers: ledger ? [ledger] : [],
              activeLedgerId: defaultId,
              activeLedger: ledger,
            });
          } else {
            // Load existing ledgers
            const ledgers = await LedgerRepository.getAll();

            // Check if we have a persisted active ledger
            const { activeLedgerId } = get();
            let activeLedger: Ledger | null = null;

            if (activeLedgerId) {
              activeLedger = await LedgerRepository.getById(activeLedgerId);
            }

            // If no active ledger, use the default one
            if (!activeLedger) {
              activeLedger = await LedgerRepository.getDefault();
              if (!activeLedger && ledgers.length > 0) {
                activeLedger = ledgers[0];
              }
            }

            set({
              ledgers,
              activeLedgerId: activeLedger?.id || null,
              activeLedger,
            });
          }
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'ledger-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ activeLedgerId: state.activeLedgerId }),
    }
  )
);
