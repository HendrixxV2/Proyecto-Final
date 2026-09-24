import { useContext } from 'react';
import { AuthContext } from '@/Context/AuthContext';

const noopAuth = {
  user: null,
  initializing: false,
  loading: false,
  error: null,
  isAuthenticated: false,
  isAdmin: false,
  login: async () => undefined,
  register: async () => undefined,
  logout: () => undefined,
  clearError: () => undefined,
};

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    console.warn('useAuth se usó fuera de <AuthProvider>; se aplicó un fallback sin sesión.');
    return noopAuth;
  }

  return ctx;
}