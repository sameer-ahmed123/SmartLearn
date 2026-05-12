import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProfileData } from "@/types/Profile/Types";

// --- 1. INTERFACE DEFINITIONS ---
interface User {
  email: string;
  full_name: string; // Django response mein 'full_name' hai
  role: "student" | "teacher";
  profile: ProfileData;
}

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null; // Naming consistent ki gayi hai
  refreshToken: string | null;
  user: User | null;
  role: "student" | "teacher" | null;

  // Actions
  login: (userData: User, access: string, refresh: string) => void;
  logout: () => void;
  setAccessToken: (token: string) => void;
  isRole: (role: "student" | "teacher") => boolean;
  updateUserProfile: (userProfile: ProfileData) => void;
}

// --- 2. THE ZUSTAND STORE ---
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // INITIAL STATE
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      user: null,
      role: null,

      // LOGIN ACTION
      login: (userData, access, refresh) => {
        set({
          isAuthenticated: true,
          accessToken: access,
          refreshToken: refresh,
          user: userData,
          role: userData.role,
        });
      },

      // LOGOUT ACTION
      logout: () => {
        set({
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          user: null,
          role: null,
        });
        // Persist middleware khud handle kar leta hai,
        // lekin extra safety ke liye localStorage clear karna theek hai.
      },

      setAccessToken: (token: string) => {
        set({ accessToken: token });
      },

      isRole: (requiredRole: "student" | "teacher") => {
        return get().role === requiredRole;
      },

      updateUserProfile: (userProfile: ProfileData) =>
        set((state) => ({
          user: state.user ? { ...state.user, profile: userProfile } : null,
        })),
    }),
    {
      name: "smartlearn-auth-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
