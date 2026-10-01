import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuth } from '@/Hooks/useAuth';
import { useToast } from '@/Hooks/useToast';
import Input from '@/Components/UI/Input';
import Button from '@/Components/UI/Button';
import { validateForm, required, email, min } from '@/Utils/validators';
import { PATHS } from '@/Routes/paths';
import { useLanguage } from '@/Hooks/useLanguage';

export default function Register() {
  const [form, setForm] = useState({ nombre: '', email: '', password: '', confirmar: '' });
  const [errors, setErrors] = useState({});
  const [accept, setAccept] = useState(false);
  const { register, loading } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();
  const navigate = useNavigate();
  const rules = {
    nombre: [required(t('register.name')), min(3, t('register.nameLength'))],
    email: [required(t('register.email')), email()],
    password: [required(t('register.password')), min(6, t('register.passwordLength'))],
    confirmar: [
      required(t('register.confirm')),
      (value, values) => (value !== values.password ? t('register.mismatch') : null),
    ],
  };

  const setField = (name) => (e) => {
    setForm((prev) => ({ ...prev, [name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { errors: vErrors, isValid } = validateForm(form, rules);
    if (!isValid) return setErrors(vErrors);

    if (!accept) {
      toast.warning(t('register.acceptTitle'), t('register.acceptDescription'));
      return;
    }

    try {
      const user = await register({ nombre: form.nombre, email: form.email, password: form.password });
      toast.success(t('register.welcome', { name: user.nombre.split(' ')[0] }), t('register.created'));
      navigate(PATHS.home, { replace: true });
    } catch (err) {
      toast.error(t('register.error'), err.message);
      setErrors({ email: err.message });
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-ink-50">{t('register.title')}</h1>
      <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">
        {t('register.description')}
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
        <Input label={t('register.nameLabel')} required value={form.nombre} onChange={setField('nombre')} error={errors.nombre} autoComplete="name" />
        <Input label={t('register.emailLabel')} type="email" required value={form.email} onChange={setField('email')} error={errors.email} autoComplete="email" />
        <Input label={t('register.passwordLabel')} type="password" required value={form.password} onChange={setField('password')} error={errors.password} autoComplete="new-password" hint={t('register.passwordHint')} />
        <Input label={t('register.confirmLabel')} type="password" required value={form.confirmar} onChange={setField('confirmar')} error={errors.confirmar} autoComplete="new-password" />

        <label className="flex items-start gap-3 text-sm text-ink-600 dark:text-ink-300">
          <input
            type="checkbox"
            checked={accept}
            onChange={(e) => setAccept(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-ink-300 text-brand-500"
          />
          <span>
            {t('register.terms')}
          </span>
        </label>

        <Button type="submit" size="lg" loading={loading} className="w-full">
          <UserPlus aria-hidden="true" className="h-4 w-4" />
          {t('register.submit')}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-600 dark:text-ink-300">
        {t('register.haveAccount')}{' '}
        <Link to={PATHS.login} className="font-semibold text-brand-600 hover:underline dark:text-brand-300">
          {t('register.login')}
        </Link>
      </p>
    </div>
  );
}