import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// --- 1. INTERFACE DEFINITIONS ---
interface User {
  id: number;
  email: string;
  name: string;
  role: 'student' | 'teacher'; // Role based dashboard switch ke liye
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  role: 'student' | 'teacher' | null;

  // Actions
  login: (userData: User, token: string, refreshToken: string) => void;
  logout: () => void;
  setAccessToken: (token: string) => void;
  isRole: (role: 'student' | 'teacher') => boolean;
}

// --- 2. THE ZUSTAND STORE ---
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // INITIAL STATE
      isAuthenticated: false,
      token: null,
      refreshToken: null,
      user: null,
      role: null,

      // LOGIN ACTION (Theek kiya gaya hai)
      login: (userData, token, refreshToken) => {
        set({
          isAuthenticated: true,
          token: token,
          refreshToken: refreshToken, // Refresh token ko bhi save karna zaroori hai
          user: userData,
          role: userData.role,
        });
      },

      // LOGOUT ACTION
      logout: () => {
        set({
          isAuthenticated: false,
          token: null,
          refreshToken: null,
          user: null,
          role: null,
        });
        localStorage.removeItem('smartlearn-auth-storage');
      },

      setAccessToken: (token: string) => {
        set({ token });
      },

      isRole: (requiredRole: 'student' | 'teacher') => {
        return get().role === requiredRole;
      },
    }),
    {
      name: 'smartlearn-auth-storage',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken, // Isay bhi persist karna zaroori hai
        user: state.user,
        role: state.role,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);