import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { LanguageProvider } from '@/Context/LanguageContext';
import { useAuth } from '@/Hooks/useAuth';
import { useToast } from '@/Hooks/useToast';
import AuthLayout from '@/Layouts/AuthLayout';
import Login from '@/Pages/Auth/Login';
import Register from '@/Pages/Auth/Register';

jest.mock('@/Hooks/useAuth', () => ({ useAuth: jest.fn() }));
jest.mock('@/Hooks/useToast', () => ({ useToast: jest.fn() }));

const mockLogin = jest.fn();
const mockRegister = jest.fn();
const mockToast = {
  warning: jest.fn(),
  success: jest.fn(),
  error: jest.fn(),
};

function Destination() {
  const location = useLocation();
  return <p>Ruta: {location.pathname}</p>;
}

function renderLogin(initialEntry = '/login') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <LanguageProvider>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
          </Route>
          <Route path="*" element={<Destination />} />
        </Routes>
      </LanguageProvider>
    </MemoryRouter>,
  );
}

function renderRegister() {
  return render(
    <MemoryRouter initialEntries={['/registro']}>
      <LanguageProvider>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/registro" element={<Register />} />
          </Route>
          <Route path="*" element={<Destination />} />
        </Routes>
      </LanguageProvider>
    </MemoryRouter>,
  );
}

describe('Login page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLogin.mockReset();
    mockRegister.mockReset();
    useAuth.mockReturnValue({ login: mockLogin, register: mockRegister, loading: false });
    useToast.mockReturnValue(mockToast);
  });

  it('validates credentials before calling the authentication context', async () => {
    renderLogin();
    await userEvent.click(screen.getByRole('button', { name: 'Ingresar' }));

    expect(mockLogin).not.toHaveBeenCalled();
    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
  });

  it('returns to the home page when the exit X is clicked', async () => {
    renderLogin();
    await userEvent.click(screen.getByRole('link', { name: 'Salir del inicio de sesión' }));

    expect(screen.getByText('Ruta: /')).toBeInTheDocument();
  });

  it('returns regular users to the protected destination after login', async () => {
    mockLogin.mockResolvedValue({ nombre: 'Ana María', rol: 'usuario_regular' });
    const user = userEvent.setup();
    renderLogin({ pathname: '/login', state: { from: { pathname: '/reservas' } } });
    await user.type(screen.getByLabelText(/^Correo electrónico/), 'ana@example.cr');
    await user.type(screen.getByLabelText(/^Contraseña/), 'secreto123');
    await user.click(screen.getByRole('button', { name: 'Ingresar' }));

    await waitFor(() => expect(screen.getByText('Ruta: /reservas')).toBeInTheDocument());
    expect(mockLogin).toHaveBeenCalledWith({ email: 'ana@example.cr', password: 'secreto123' });
    expect(mockToast.success).toHaveBeenCalledWith('¡Bienvenida/o, Ana!', 'Sesión iniciada correctamente.');
  });

  it('sends administrators to the dashboard and reports login errors', async () => {
    mockLogin.mockResolvedValueOnce({ nombre: 'Admin Central', rol: 'admin' });
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByLabelText(/^Correo electrónico/), 'admin@example.cr');
    await user.type(screen.getByLabelText(/^Contraseña/), 'secreto123');
    await user.click(screen.getByRole('button', { name: 'Ingresar' }));

    await waitFor(() => expect(screen.getByText('Ruta: /admin/dashboard')).toBeInTheDocument());

    mockLogin.mockRejectedValueOnce(new Error('Cuenta bloqueada.'));
    renderLogin();
    await user.type(screen.getByLabelText(/^Correo electrónico/), 'admin@example.cr');
    await user.type(screen.getByLabelText(/^Contraseña/), 'secreto123');
    await user.click(screen.getByRole('button', { name: 'Ingresar' }));

    await waitFor(() => expect(mockToast.error).toHaveBeenCalledWith('No se pudo iniciar sesión', 'Cuenta bloqueada.'));
    expect(screen.getByRole('alert')).toHaveTextContent('Credenciales inválidas.');
  });
});

describe('Register page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLogin.mockReset();
    mockRegister.mockReset();
    useAuth.mockReturnValue({ login: mockLogin, register: mockRegister, loading: false });
    useToast.mockReturnValue(mockToast);
  });

  it('requires matching passwords and acceptance of terms before registering', async () => {
    const user = userEvent.setup();
    renderRegister();
    await user.type(screen.getByLabelText(/^Nombre completo/), 'Ana María');
    await user.type(screen.getByLabelText(/^Correo electrónico/), 'ana@example.cr');
    await user.type(screen.getByLabelText(/^Contraseña/), 'secreto123');
    await user.type(screen.getByLabelText(/^Confirmar contraseña/), 'distinta123');
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Las contraseñas no coinciden.');
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('asks for terms acceptance, then registers and navigates home', async () => {
    mockRegister.mockResolvedValue({ nombre: 'Ana María' });
    const user = userEvent.setup();
    renderRegister();
    await user.type(screen.getByLabelText(/^Nombre completo/), 'Ana María');
    await user.type(screen.getByLabelText(/^Correo electrónico/), 'ana@example.cr');
    await user.type(screen.getByLabelText(/^Contraseña/), 'secreto123');
    await user.type(screen.getByLabelText(/^Confirmar contraseña/), 'secreto123');
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(mockToast.warning).toHaveBeenCalledWith(
      'Acepta los términos',
      'Debes aceptar las condiciones de uso para continuar.',
    );
    expect(mockRegister).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    await waitFor(() => expect(mockRegister).toHaveBeenCalledWith({
      nombre: 'Ana María',
      email: 'ana@example.cr',
      password: 'secreto123',
    }));
    expect(screen.getByText('Ruta: /')).toBeInTheDocument();
    expect(mockToast.success).toHaveBeenCalledWith('¡Bienvenida/o, Ana!', 'Tu cuenta fue creada correctamente.');
  });

  it('shows registration conflicts next to the email field', async () => {
    mockRegister.mockRejectedValue(new Error('Ya existe una cuenta con este correo.'));
    const user = userEvent.setup();
    renderRegister();
    await user.type(screen.getByLabelText(/^Nombre completo/), 'Ana María');
    await user.type(screen.getByLabelText(/^Correo electrónico/), 'ana@example.cr');
    await user.type(screen.getByLabelText(/^Contraseña/), 'secreto123');
    await user.type(screen.getByLabelText(/^Confirmar contraseña/), 'secreto123');
    fireEvent.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    await waitFor(() => expect(mockToast.error).toHaveBeenCalledWith(
      'No se pudo crear la cuenta',
      'Ya existe una cuenta con este correo.',
    ));
    expect(screen.getByRole('alert')).toHaveTextContent('Ya existe una cuenta con este correo.');
  });
});