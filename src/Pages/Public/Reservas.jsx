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

const rules = {
  espacioId: [required('Selecciona un espacio.')],
  fecha: [required('Selecciona una fecha.'), (v) => (!isFutureDate(v) ? 'La fecha debe ser hoy o posterior.' : null)],
  horaInicio: [required('Indica la hora de inicio.')],
  horaFin: [required('Indica la hora de fin.')],
  motivo: [required('Describe el motivo de la reserva.'), (v) => (String(v).trim().length < 10 ? 'Describe el motivo con al menos 10 caracteres.' : null)],
};

export default function Reservas() {
  const [params] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

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
      vErrors.horaFin = 'La hora de fin debe ser posterior a la hora de inicio.';
    }

    if (!isValid || Object.keys(vErrors).length) {
      setErrors(vErrors);
      toast.warning('Revisa el formulario', 'Hay campos que necesitan corrección.');
      return;
    }

    if (!isAuthenticated) {
      toast.info('Inicia sesión para continuar', 'Necesitamos identificarte para gestionar tu reserva.');
      return;
    }

    setEnviando(true);
    try {
      await reservasService.create({
        ...form,
        espacioId: Number(form.espacioId),
        usuarioId: user.id,
      });
      toast.success('Solicitud enviada', 'Revisaremos tu reserva y te notificaremos por correo.');
      setExito(true);
      setForm({ espacioId: '', fecha: '', horaInicio: '', horaFin: '', motivo: '' });
    } catch (err) {
      toast.error('No se pudo enviar la solicitud', err.message);
      setErrors({ horaInicio: err.message });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionTitle
        eyebrow="Solicitudes"
        title="Reservar un espacio"
        description="Completa el formulario y el equipo administrativo validará la disponibilidad del espacio."
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <form onSubmit={handleSubmit} noValidate className="space-y-5 rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-700 dark:bg-ink-800">
          <Select
            label="Espacio"
            required
            placeholder={cargandoEspacios ? 'Cargando espacios…' : 'Selecciona un espacio'}
            value={form.espacioId}
            onChange={setField('espacioId')}
            error={errors.espacioId}
            options={(espacios ?? []).map((e) => ({
              value: String(e.id),
              label: `${e.nombre} · ${e.capacidad} personas`,
            }))}
          />

          <Input
            label="Fecha"
            type="date"
            required
            value={form.fecha}
            onChange={setField('fecha')}
            error={errors.fecha}
            min={new Date().toISOString().slice(0, 10)}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Hora de inicio" type="time" required value={form.horaInicio} onChange={setField('horaInicio')} error={errors.horaInicio} />
            <Input label="Hora de fin" type="time" required value={form.horaFin} onChange={setField('horaFin')} error={errors.horaFin} />
          </div>

          <Textarea
            label="Motivo de la reserva"
            required
            value={form.motivo}
            onChange={setField('motivo')}
            error={errors.motivo}
            placeholder="Ej.: Ensayo del grupo de danza juvenil de Orotina"
          />

          {!isAuthenticated && (
            <p role="status" className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950/50 dark:text-amber-100">
              Debes iniciar sesión para enviar una solicitud de reserva.
            </p>
          )}

          <Button type="submit" size="lg" loading={enviando} className="w-full">
            <CalendarCheck aria-hidden="true" className="h-4 w-4" />
            Enviar solicitud
          </Button>
        </form>

        <aside className="space-y-5">
          {exito && (
            <div role="status" className="rounded-2xl border border-jade-300 bg-jade-50 p-5 dark:border-jade-700 dark:bg-jade-900/40">
              <CheckCircle2 aria-hidden="true" className="h-6 w-6 text-jade-600 dark:text-jade-300" />
              <h3 className="mt-2 font-display text-base font-bold text-jade-900 dark:text-jade-100">¡Solicitud registrada!</h3>
              <p className="mt-1 text-sm text-jade-800 dark:text-jade-200">
                Puedes revisar el estado de tu reserva en la sección “Mis reservas”.
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-ink-200 bg-white p-5 text-sm text-ink-600 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-300">
            <h3 className="font-display text-base font-bold text-ink-900 dark:text-ink-50">Antes de reservar</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Las reservas se confirman en un plazo máximo de 48 horas hábiles.</li>
              <li>El pago de la tarifa se realiza en la recepción del centro.</li>
              <li>Cancelaciones con menos de 72 horas de anticipación tienen recargo del 25%.</li>
              <li>Los espacios accesibles están señalizados en la ficha de cada sala.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}