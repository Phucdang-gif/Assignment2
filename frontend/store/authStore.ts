import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: number;
  email: string;
  role?: string;
  loyaltyPoints?: number;
}

interface AuthStore {
  token: string | null;
  user: AuthUser | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  setUser: (user: AuthUser) => void;
  updateLoyaltyPoints: (points: number) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      setUser: (user) => set({ user }),
      updateLoyaltyPoints: (points) =>
        set((state) => ({
          user: state.user ? { ...state.user, loyaltyPoints: points } : null,
        })),
    }),
    {
      name: 'auth-storage',
    },
  ),
);
