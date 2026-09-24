import { createContext, useCallback, useEffect, useMemo, useReducer } from 'react';
import { authService } from '@/Services/authService';

export const AuthContext = createContext(null);

const initialState = {
  user: null,
  initializing: true,
  loading: false,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'INIT_DONE':
      return { ...state, user: action.payload, initializing: false };
    case 'REQUEST':
      return { ...state, loading: true, error: null };
    case 'SUCCESS':
      return { ...state, loading: false, user: action.payload, error: null };
    case 'FAILURE':
      return { ...state, loading: false, error: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, error: null, loading: false };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    dispatch({ type: 'INIT_DONE', payload: authService.getSession() });
  }, []);

  const login = useCallback(async (credenciales) => {
    dispatch({ type: 'REQUEST' });
    try {
      const user = await authService.login(credenciales);
      dispatch({ type: 'SUCCESS', payload: user });
      return user;
    } catch (error) {
      dispatch({ type: 'FAILURE', payload: error.message });
      throw error;
    }
  }, []);

  const register = useCallback(async (datos) => {
    dispatch({ type: 'REQUEST' });
    try {
      const user = await authService.register(datos);
      dispatch({ type: 'SUCCESS', payload: user });
      return user;
    } catch (error) {
      dispatch({ type: 'FAILURE', payload: error.message });
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      isAuthenticated: Boolean(state.user),
      isAdmin: state.user?.rol === 'admin',
      login,
      register,
      logout,
      clearError: () => dispatch({ type: 'FAILURE', payload: null }),
    }),
    [state, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}