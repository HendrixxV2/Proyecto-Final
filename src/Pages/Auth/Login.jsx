import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '@/Hooks/useAuth';
import { useToast } from '@/Hooks/useToast';
import Input from '@/Components/UI/Input';
import Button from '@/Components/UI/Button';
import { validateForm, required, email, min } from '@/Utils/validators';
import { PATHS } from '@/Routes/paths';
import { useLanguage } from '@/Hooks/useLanguage';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const { login, loading } = useAuth();
  const toast = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const destino = location.state?.from?.pathname ?? PATHS.home;
  const rules = {
    email: [required(t('auth.email')), email()],
    password: [required(t('auth.password')), min(6, t('auth.invalidCredentials'))],
  };

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
      toast.success(t('auth.welcome').replace('{name}', user.nombre.split(' ')[0]), t('auth.loginSuccess'));
      navigate(user.rol === 'admin' ? PATHS.admin.dashboard : destino, { replace: true });
    } catch (err) {
      toast.error(t('auth.loginError'), err.message);
      setErrors({ password: t('auth.invalidCredentials') });
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-50">{t('auth.loginTitle')}</h1>
      <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">
        {t('auth.loginDescription')}
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <Input
          label={t('auth.email')}
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={setField('email')}
          error={errors.email}
          placeholder="tu.correo@ejemplo.cr"
        />

        <Input
          label={t('auth.password')}
          type="password"
          autoComplete="current-password"
          required
          value={form.password}
          onChange={setField('password')}
          error={errors.password}
        />

        <Button type="submit" size="lg" loading={loading} className="w-full">
          <LogIn aria-hidden="true" className="h-4 w-4" />
          {t('auth.submitLogin')}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-ink-600 dark:text-ink-300">
        {t('auth.noAccount')}{' '}
        <Link to={PATHS.registro} className="font-semibold text-brand-600 hover:underline dark:text-brand-300">
          {t('auth.register')}
        </Link>
      </p>

      <div className="mt-6 rounded-lg border border-dashed border-ink-300 p-3 text-xs text-ink-500 dark:border-ink-600 dark:text-ink-400">
        <p className="font-semibold">{t('auth.demoAccounts')}</p>
        <p className="mt-1">{t('auth.adminAccount')}</p>
        <p>{t('auth.userAccount')}</p>
      </div>
    </div>
  );
}