import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthContext } from '@/Context/AuthContext';
import Forbidden from '@/Pages/Forbidden';
import NotFound from '@/Pages/NotFound';
import RoleRoute from '@/Routes/RoleRoute';
import { LanguageProvider } from '@/Context/LanguageContext';

function renderRoleRoute(user, roles, fallback = null) {
  return render(
    <LanguageProvider>
      <AuthContext.Provider value={{ user }}>
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route path="/login" element={<p>Inicio de sesión</p>} />
            <Route path="/" element={<p>Inicio</p>} />
            <Route element={<RoleRoute roles={roles} fallback={fallback} />}>
              <Route path="/admin" element={<p>Panel autorizado</p>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    </LanguageProvider>,
  );
}

describe('RoleRoute', () => {
  it('redirects unauthenticated users to login', () => {
    renderRoleRoute(null, ['admin']);

    expect(screen.getByText('Inicio de sesión')).toBeInTheDocument();
    expect(screen.queryByText('Panel autorizado')).not.toBeInTheDocument();
  });

  it('shows the forbidden page when the user lacks an allowed role', () => {
    renderRoleRoute({ id: 3, rol: 'usuario_regular' }, ['admin']);

    expect(screen.getByRole('heading', { name: 'Acceso restringido' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/');
  });

  it('renders the protected outlet for an allowed role', () => {
    renderRoleRoute({ id: 3, rol: 'admin' }, ['admin']);

    expect(screen.getByText('Panel autorizado')).toBeInTheDocument();
  });

  it('allows any authenticated role when no role list is specified', () => {
    renderRoleRoute({ id: 3, rol: 'usuario_regular' }, []);

    expect(screen.getByText('Panel autorizado')).toBeInTheDocument();
  });

  it('renders a custom fallback for unauthorized users', () => {
    renderRoleRoute({ id: 3, rol: 'usuario_regular' }, ['admin'], <p>Sin autorización</p>);

    expect(screen.getByText('Sin autorización')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Acceso restringido' })).not.toBeInTheDocument();
  });
});

describe('Forbidden and NotFound pages', () => {
  it.each([
    ['Forbidden', <Forbidden />, 'Acceso restringido'],
    ['NotFound', <NotFound />, '404'],
  ])('provides a home link from %s', (_, page, heading) => {
    render(
      <LanguageProvider>
        <MemoryRouter>
          {page}
        </MemoryRouter>
      </LanguageProvider>,
    );

    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/');
  });
});