import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PrivateRoute from '@/Routes/PrivateRoute';
import { AuthContext } from '@/Context/AuthContext';

const renderConAuth = (authValue, initialPath = '/privado') =>
  render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/login" element={<p>Pantalla de login</p>} />
          <Route element={<PrivateRoute />}>
            <Route path="/privado" element={<p>Contenido privado</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );

describe('<PrivateRoute />', () => {
  it('redirige al login cuando no hay sesión', () => {
    renderConAuth({ isAuthenticated: false, initializing: false, user: null });
    expect(screen.getByText(/pantalla de login/i)).toBeInTheDocument();
  });

  it('renderiza la ruta hija cuando hay sesión activa', () => {
    renderConAuth({ isAuthenticated: true, initializing: false, user: { id: 2, rol: 'usuario_regular' } });
    expect(screen.getByText(/contenido privado/i)).toBeInTheDocument();
  });

  it('muestra el estado de verificación mientras inicializa', () => {
    renderConAuth({ isAuthenticated: false, initializing: true, user: null });
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});