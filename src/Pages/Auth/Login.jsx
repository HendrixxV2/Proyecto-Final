import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '@/Hooks/useAuth';
import { useToast } from '@/Hooks/useToast';
import Input from '@/Components/UI/Input';
import Button from '@/Components/UI/Button';
import { validateForm, required, email, min } from '@/Utils/validators';
import { PATHS } from '@/Routes/paths';

const rules = {
  email: [required('Ingresa tu correo.'), email()],
  password: [required('Ingresa tu contraseña.'), min(6, 'La contraseña debe tener al menos 6 caracteres.')],
};

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const { login, loading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const destino = location.state?.from?.pathname ?? PATHS.home;

  const setField = (name) => (e) => {
    setForm((prev) => ({ ...prev, [name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { errors: vErrors, isValid } = validateForm(form, rules);
    if (!isValid) {
      setErrors(vErrors);
      return;
    }

    try {
      const user = await login(form);
      toast.success(`¡Bienvenida/o, ${user.nombre.split(' ')[0]}!`, 'Sesión iniciada correctamente.');
      navigate(user.rol === 'admin' ? PATHS.admin.dashboard : destino, { replace: true });
    } catch (err) {
      toast.error('No se pudo iniciar sesión', err.message);
      setErrors({ password: 'Credenciales inválidas.' });
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-ink-50">Iniciar sesión</h1>
      <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">
        Accede para gestionar tus reservas y boletos.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
        <Input
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={setField('email')}
          error={errors.email}
          placeholder="tu.correo@ejemplo.cr"
        />

        <Input
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          required
          value={form.password}
          onChange={setField('password')}
          error={errors.password}
        />

        <Button type="submit" size="lg" loading={loading} className="w-full">
          <LogIn aria-hidden="true" className="h-4 w-4" />
          Ingresar
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-600 dark:text-ink-300">
        ¿No tienes cuenta?{' '}
        <Link to={PATHS.registro} className="font-semibold text-brand-600 hover:underline dark:text-brand-300">
          Regístrate
        </Link>
      </p>

      <div className="mt-8 rounded-xl border border-dashed border-ink-300 p-4 text-xs text-ink-500 dark:border-ink-600 dark:text-ink-400">
        <p className="font-semibold">Cuentas de demostración</p>
        <p className="mt-1">Admin: admin@orotina.cr / admin123</p>
        <p>Usuario: usuario@orotina.cr / user123</p>
      </div>
    </div>
  );
}