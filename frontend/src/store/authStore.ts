import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roles: string[];
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setTokens: (accessToken: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  setTokens: (accessToken) => set({ accessToken }),
  setUser: (user) => set({ user }),
  logout: () => set({ user: null, accessToken: null }),
}));
