import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuth } from '@/Hooks/useAuth';
import { useToast } from '@/Hooks/useToast';
import Input from '@/Components/UI/Input';
import Button from '@/Components/UI/Button';
import { validateForm, required, email, min } from '@/Utils/validators';
import { PATHS } from '@/Routes/paths';

const rules = {
  nombre: [required('Ingresa tu nombre completo.'), min(3, 'El nombre debe tener al menos 3 caracteres.')],
  email: [required('Ingresa tu correo.'), email()],
  password: [required('Crea una contraseña.'), min(6, 'Debe tener al menos 6 caracteres.')],
  confirmar: [
    required('Confirma tu contraseña.'),
    (v, values) => (v !== values.password ? 'Las contraseñas no coinciden.' : null),
  ],
};

export default function Register() {
  const [form, setForm] = useState({ nombre: '', email: '', password: '', confirmar: '' });
  const [errors, setErrors] = useState({});
  const [accept, setAccept] = useState(false);
  const { register, loading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const setField = (name) => (e) => {
    setForm((prev) => ({ ...prev, [name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { errors: vErrors, isValid } = validateForm(form, rules);
    if (!isValid) return setErrors(vErrors);

    if (!accept) {
      toast.warning('Acepta los términos', 'Debes aceptar las condiciones de uso para continuar.');
      return;
    }

    try {
      const user = await register({ nombre: form.nombre, email: form.email, password: form.password });
      toast.success(`¡Bienvenida/o, ${user.nombre.split(' ')[0]}!`, 'Tu cuenta fue creada correctamente.');
      navigate(PATHS.home, { replace: true });
    } catch (err) {
      toast.error('No se pudo crear la cuenta', err.message);
      setErrors({ email: err.message });
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-ink-50">Crear cuenta</h1>
      <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">
        Únete a la comunidad cultural de Orotina.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
        <Input label="Nombre completo" required value={form.nombre} onChange={setField('nombre')} error={errors.nombre} autoComplete="name" />
        <Input label="Correo electrónico" type="email" required value={form.email} onChange={setField('email')} error={errors.email} autoComplete="email" />
        <Input label="Contraseña" type="password" required value={form.password} onChange={setField('password')} error={errors.password} autoComplete="new-password" hint="Mínimo 6 caracteres." />
        <Input label="Confirmar contraseña" type="password" required value={form.confirmar} onChange={setField('confirmar')} error={errors.confirmar} autoComplete="new-password" />

        <label className="flex items-start gap-3 text-sm text-ink-600 dark:text-ink-300">
          <input
            type="checkbox"
            checked={accept}
            onChange={(e) => setAccept(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-ink-300 text-brand-500"
          />
          <span>
            Acepto las condiciones de uso y el tratamiento de mis datos para la gestión de reservas y boletos del centro.
          </span>
        </label>

        <Button type="submit" size="lg" loading={loading} className="w-full">
          <UserPlus aria-hidden="true" className="h-4 w-4" />
          Crear cuenta
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-600 dark:text-ink-300">
        ¿Ya tienes cuenta?{' '}
        <Link to={PATHS.login} className="font-semibold text-brand-600 hover:underline dark:text-brand-300">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}