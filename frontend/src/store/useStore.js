import { create } from "zustand";
import { persist } from "zustand/middleware";

// token is persisted (admin session); everything else is in-memory only.
export const useStore = create(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
      logout: () => set({ token: null }),

      online: 0,
      setOnline: (online) => set({ online }),

      // Set by a quest's "skills earned" chip; the skill tree picks it up, selects that node and clears it.
      focusSkill: null,
      setFocusSkill: (focusSkill) => set({ focusSkill }),

      toasts: [],
      pushToast: (message) => {
        const id = crypto.randomUUID();
        set((s) => ({ toasts: [...s.toasts, { id, message }] }));
        setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 4500);
      },
    }),
    { name: "portfolio-auth", partialize: (s) => ({ token: s.token }) },
  ),
);
