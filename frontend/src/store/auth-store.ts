import { create } from 'zustand';
import { User, AuthResponse } from '../lib/types';
import { authAPI } from '../lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

const DEMO_USER: User = {
  id: 'demo-user-123',
  name: 'Demo Executive',
  email: 'demo@finai.com',
  role: 'user',
  currency: 'INR',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });

      // Immediate authentication for demo account
      if (email.trim().toLowerCase() === 'demo@finai.com' && password === 'demo123456') {
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', 'finai-demo-token');
          localStorage.setItem('refreshToken', 'finai-demo-refresh-token');
          localStorage.setItem('finai:demo-mode', 'true');
        }
        set({ user: DEMO_USER, isAuthenticated: true, isLoading: false });
        return;
      }

      const { data } = await authAPI.login({ email, password });
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      if (email.trim().toLowerCase() === 'demo@finai.com') {
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', 'finai-demo-token');
          localStorage.setItem('refreshToken', 'finai-demo-refresh-token');
          localStorage.setItem('finai:demo-mode', 'true');
        }
        set({ user: DEMO_USER, isAuthenticated: true, isLoading: false });
        return;
      }
      const message = error.response?.data?.error || 
        (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')
          ? 'Unable to connect to backend server. Try signing in with the Demo Account below.'
          : error.message || 'Login failed');
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  signup: async (email: string, password: string, name: string) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await authAPI.signup({ email, password, name });
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.error || 
        (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')
          ? 'Backend is currently offline. You can sign in with the Demo Account to explore.'
          : error.message || 'Signup failed');
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  loadUser: async () => {
    if (typeof window === 'undefined') {
      set({ isLoading: false });
      return;
    }
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        set({ isLoading: false });
        return;
      }

      if (token === 'finai-demo-token') {
        set({ user: DEMO_USER, isAuthenticated: true, isLoading: false });
        return;
      }

      set({ isLoading: true });
      const { data } = await authAPI.getProfile();
      set({ user: data, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
