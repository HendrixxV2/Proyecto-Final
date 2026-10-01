import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarCheck, CheckCircle2 } from 'lucide-react';
import { useFetch } from '@/Hooks/useFetch';
import { useAuth } from '@/Hooks/useAuth';
import { useToast } from '@/Hooks/useToast';
import { espaciosService } from '@/Services/espaciosService';
import { reservasService } from '@/Services/reservasService';
import SectionTitle from '@/Components/Common/SectionTitle';
import Button from '@/Components/UI/Button';
import Input from '@/Components/UI/Input';
import Select from '@/Components/UI/Select';
import Textarea from '@/Components/UI/Textarea';
import { validateForm, required, isFutureDate, rangoHorarioValido } from '@/Utils/validators';
import { useLanguage } from '@/Hooks/useLanguage';

export default function Reservas() {
  const [params] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const { t } = useLanguage();

  const rules = {
    espacioId: [required(t('booking.selectSpace'))],
    fecha: [required(t('booking.selectDate')), (v) => (!isFutureDate(v) ? t('booking.futureDate') : null)],
    horaInicio: [required(t('booking.indicateStart'))],
    horaFin: [required(t('booking.indicateEnd'))],
    motivo: [required(t('booking.describeReason')), (v) => (String(v).trim().length < 10 ? t('booking.minReason') : null)],
  };

  const { data: espacios, loading: cargandoEspacios } = useFetch(() => espaciosService.list({ activo: true }), []);

  const [form, setForm] = useState({
    espacioId: params.get('espacio') ?? '',
    fecha: '',
    horaInicio: '',
    horaFin: '',
    motivo: '',
  });
  const [errors, setErrors] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);

  const setField = (name) => (e) => {
    setForm((prev) => ({ ...prev, [name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { errors: vErrors, isValid } = validateForm(form, rules);
    if (!rangoHorarioValido(form.horaInicio, form.horaFin)) {
      vErrors.horaFin = t('booking.endAfterStart');
    }

    if (!isValid || Object.keys(vErrors).length) {
      setErrors(vErrors);
      toast.warning(t('booking.invalidForm'), t('booking.invalidFormDescription'));
      return;
    }

    if (!isAuthenticated) {
      toast.info(t('booking.loginToast'), t('booking.loginToastDescription'));
      return;
    }

    setEnviando(true);
    try {
      await reservasService.create({
        ...form,
        espacioId: Number(form.espacioId),
        usuarioId: user.id,
      });
      toast.success(t('booking.sent'), t('booking.sentDescription'));
      setExito(true);
      setForm({ espacioId: '', fecha: '', horaInicio: '', horaFin: '', motivo: '' });
    } catch (err) {
      toast.error(t('booking.sendError'), err.message);
      setErrors({ horaInicio: err.message });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className="relative isolate min-h-[calc(100vh-4rem)] overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/zonaReservaciones.jpg')" }}
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-white/65 dark:bg-ink-950/70" />

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow={t('booking.eyebrow')}
          title={t('booking.title')}
          description={t('booking.description')}
        />

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <form onSubmit={handleSubmit} noValidate className="space-y-5 rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-700 dark:bg-ink-800">
          <Select
            label={t('booking.space')}
            required
            placeholder={cargandoEspacios ? t('booking.loadingSpaces') : t('booking.selectSpace')}
            value={form.espacioId}
            onChange={setField('espacioId')}
            error={errors.espacioId}
            options={(espacios ?? []).map((e) => ({
              value: String(e.id),
              label: `${e.nombre} · ${t('booking.people').replace('{count}', e.capacidad)}`,
            }))}
          />

          <Input
            label={t('booking.date')}
            type="date"
            required
            value={form.fecha}
            onChange={setField('fecha')}
            error={errors.fecha}
            min={new Date().toISOString().slice(0, 10)}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <Input label={t('booking.startTime')} type="time" required value={form.horaInicio} onChange={setField('horaInicio')} error={errors.horaInicio} />
            <Input label={t('booking.endTime')} type="time" required value={form.horaFin} onChange={setField('horaFin')} error={errors.horaFin} />
          </div>

          <Textarea
            label={t('booking.reason')}
            required
            value={form.motivo}
            onChange={setField('motivo')}
            error={errors.motivo}
            placeholder={t('booking.reasonPlaceholder')}
          />

          {!isAuthenticated && (
            <p role="status" className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950/50 dark:text-amber-100">
              {t('booking.loginRequired')}
            </p>
          )}

          <Button type="submit" size="lg" loading={enviando} className="w-full">
            <CalendarCheck aria-hidden="true" className="h-4 w-4" />
            {t('booking.submit')}
          </Button>
        </form>

        <aside className="space-y-5">
          {exito && (
            <div role="status" className="rounded-2xl border border-jade-300 bg-jade-50 p-5 dark:border-jade-700 dark:bg-jade-900/40">
              <CheckCircle2 aria-hidden="true" className="h-6 w-6 text-jade-600 dark:text-jade-300" />
              <h3 className="mt-2 font-display text-base font-bold text-jade-900 dark:text-jade-100">{t('booking.successTitle')}</h3>
              <p className="mt-1 text-sm text-jade-800 dark:text-jade-200">
                {t('booking.successDescription')}
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-ink-200 bg-white p-5 text-sm text-ink-600 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-300">
            <h3 className="font-display text-base font-bold text-ink-900 dark:text-ink-50">{t('booking.beforeTitle')}</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>{t('booking.beforeOne')}</li>
              <li>{t('booking.beforeTwo')}</li>
              <li>{t('booking.beforeThree')}</li>
              <li>{t('booking.beforeFour')}</li>
            </ul>
          </div>
        </aside>
        </div>
      </div>
    </section>
  );
}