import { act, renderHook, waitFor } from '@testing-library/react';
import { useContext } from 'react';
import { AuthContext, AuthProvider } from '@/Context/AuthContext';
import { authService } from '@/Services/authService';

jest.mock('@/Services/authService', () => ({
  authService: {
    getSession: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  },
}));

const admin = { id: 1, nombre: 'Admin', rol: 'admin' };
const regularUser = { id: 2, nombre: 'Ana', rol: 'usuario_regular' };
const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authService.getSession.mockReturnValue(null);
  });

  it('restores the stored session and derives administrator access', async () => {
    authService.getSession.mockReturnValue(admin);
    const { result } = renderHook(() => useContext(AuthContext), { wrapper });

    await waitFor(() => expect(result.current.initializing).toBe(false));

    expect(result.current.user).toEqual(admin);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isAdmin).toBe(true);
  });

  it('updates loading and session state after a successful login', async () => {
    let resolveLogin;
    authService.login.mockReturnValue(new Promise((resolve) => {
      resolveLogin = resolve;
    }));
    const { result } = renderHook(() => useContext(AuthContext), { wrapper });
    await waitFor(() => expect(result.current.initializing).toBe(false));

    let loginPromise;
    act(() => {
      loginPromise = result.current.login({ email: 'ana@test.cr', password: 'secreto' });
    });
    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolveLogin(regularUser);
      await loginPromise;
    });

    expect(result.current.user).toEqual(regularUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.loading).toBe(false);
  });

  it('exposes login errors and allows clearing them', async () => {
    authService.login.mockRejectedValue(new Error('Credenciales inválidas.'));
    const { result } = renderHook(() => useContext(AuthContext), { wrapper });
    await waitFor(() => expect(result.current.initializing).toBe(false));

    await act(async () => {
      await expect(result.current.login({})).rejects.toThrow('Credenciales inválidas.');
    });
    expect(result.current.error).toBe('Credenciales inválidas.');
    expect(result.current.loading).toBe(false);

    act(() => result.current.clearError());
    expect(result.current.error).toBeNull();
  });

  it('registers a session and clears it on logout', async () => {
    authService.register.mockResolvedValue(regularUser);
    const { result } = renderHook(() => useContext(AuthContext), { wrapper });
    await waitFor(() => expect(result.current.initializing).toBe(false));

    await act(async () => {
      await result.current.register({ nombre: 'Ana' });
    });
    expect(result.current.user).toEqual(regularUser);

    act(() => result.current.logout());
    expect(authService.logout).toHaveBeenCalledTimes(1);
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});