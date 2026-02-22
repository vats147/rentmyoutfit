import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

export interface User {
  id: string;
  phone?: string;
  email?: string;
  displayName?: string;
  username?: string;
  profileImage?: string;
  gender?: string;
  role: 'customer' | 'seller' | 'both';
  kycStatus: 'pending' | 'verified' | 'rejected';
  isBanned: boolean;
  isHoldSelling: boolean;
  referralCode?: string;
  walletBalance: number;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  onboardingStep: number;
  tempPhone: string;

  // Actions
  setUser: (user: User | null) => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setOnboardingStep: (step: number) => void;
  setTempPhone: (phone: string) => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      onboardingStep: 0,
      tempPhone: '',

      setUser: (user) => set({
        user,
        isAuthenticated: !!user,
        isLoading: false
      }),

      loginWithGoogle: async () => {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/v1/callback`,
          },
        });
        if (error) throw error;
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({
          user: null,
          isAuthenticated: false,
          onboardingStep: 0,
          tempPhone: ''
        });
      },

      setLoading: (loading) => set({ isLoading: loading }),

      setOnboardingStep: (step) => set({ onboardingStep: step }),

      setTempPhone: (phone) => set({ tempPhone: phone }),

      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      }))
    }),
    {
      name: 'shahidra-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
