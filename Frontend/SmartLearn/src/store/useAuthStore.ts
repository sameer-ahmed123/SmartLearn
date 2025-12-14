import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ----------------------------------------------------
// 1. INTERFACE DEFINITIONS (Type Safety)
// ----------------------------------------------------

/** Defines the structure for a logged-in User object */
interface User {
  id: number;
  email: string;
  name: string; // Used for ProfileIcon
  role: 'student' | 'teacher'; // Explicitly defined here as well
  // Add other user details you get from the Django backend
  // e.g., avatarUrl: string;
}

/** Defines the shape of the entire Authentication State */
interface AuthState {
  // State variables
  isAuthenticated: boolean;
  token: string | null;
  refreshToken :string |null;
  user: User | null;
  role: 'student' | 'teacher' | null;

  // Actions (Functions that modify state)
  login: (userData: User, token: string, refreshToken: string) => void;
  logout: () => void;
  setAccessToken: (token: string) => void; // Used by interceptor to update store
  // A helper function to check if the user is a specific role
  isRole: (role: 'student' | 'teacher') => boolean; 
}

// ----------------------------------------------------
// 2. THE ZUSTAND STORE
// ----------------------------------------------------

export const useAuthStore = create<AuthState>()(
  // Use 'persist' middleware to automatically save the state to localStorage
  persist(
    (set, get) => ({
      // INITIAL STATE
      isAuthenticated: false,
      token: null,
      refreshToken:null,
      user: null,
      role: null,

      // ACTIONS
      
      /**
       * Saves user data and JWT token upon successful login.
       * @param userData - The user object returned from the Django backend.
       * @param token - The JWT or session token.
       */
      login: (userData: User, token: string) => {
        set({
          isAuthenticated: true,
          token: token,
          user: userData,
          role: userData.role, // Set the role directly from user data
        });
        // Optional: Navigate user to dashboard after login (handled by parent component typically)
      },

      /**
       * Clears all authentication state.
       */
      logout: () => {
        set({
          isAuthenticated: false,
          token: null,
          user: null,
          role: null,
        });
        // Optional: Redirect to login page (handled by parent component/router)
      },
      setAccessToken: (token: string) => {
        set({ token });
      },

      /**
       * Helper function to check the current user role.
       * @param requiredRole - The role to check against ('Student' or 'Teacher').
       */
      isRole: (requiredRole: 'student' | 'teacher') => {
        return get().role === requiredRole;
      },
    }),
    {
      name: 'smartlearn-auth-storage', // Key used in localStorage
      // only store the token and role in local storage for rehydration
      partialize: (state) => ({ token: state.token, user: state.user, role: state.role, isAuthenticated: state.isAuthenticated }), 
    }
  )
);