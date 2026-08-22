import { create } from 'zustand';

export interface ToastNotification {
  id: string;
  type: 'success' | 'warning' | 'danger' | 'info';
  message: string;
}

interface UIState {
  isQuickAddOpen: boolean;
  quickAddType: 'unplanned' | 'credit_tx' | 'goal_saving' | null;
  toasts: ToastNotification[];

  openQuickAdd: (type?: 'unplanned' | 'credit_tx' | 'goal_saving') => void;
  closeQuickAdd: () => void;
  addToast: (message: string, type?: 'success' | 'warning' | 'danger' | 'info') => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isQuickAddOpen: false,
  quickAddType: null,
  toasts: [],

  openQuickAdd: (type = 'unplanned') => set({ isQuickAddOpen: true, quickAddType: type }),
  closeQuickAdd: () => set({ isQuickAddOpen: false, quickAddType: null }),

  addToast: (message, type = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    set((state) => ({ toasts: [...state.toasts, { id, type, message }] }));

    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3500);
  },

  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
