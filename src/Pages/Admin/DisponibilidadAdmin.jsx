import { useState } from 'react';
import { CalendarDays, CircleSlash, Clock } from 'lucide-react';
import { useFetch } from '@/Hooks/useFetch';
import { espaciosService } from '@/Services/espaciosService';
import { reservasService } from '@/Services/reservasService';
import Select from '@/Components/UI/Select';
import Input from '@/Components/UI/Input';
import Badge from '@/Components/UI/Badge';
import EmptyState from '@/Components/UI/EmptyState';
import { SkeletonTable } from '@/Components/UI/Skeleton';
import { formatRangoHoras } from '@/Utils/format';
import { BADGE_TONE_BY_ESTADO } from '@/Utils/constants';

const HORARIO = Array.from({ length: 13 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`);

export default function DisponibilidadAdmin() {
  const [espacioId, setEspacioId] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));

  const { data: espacios } = useFetch(() => espaciosService.list(), []);
  const { data: reservas, loading } = useFetch(
    () => (espacioId ? reservasService.listByEspacioYFecha(espacioId, fecha) : Promise.resolve([])),
    [espacioId, fecha],
  );

  const ocupado = (hora) =>
    (reservas ?? []).some((r) => hora >= r.horaInicio && hora < r.horaFin && !['rechazada', 'cancelada'].includes(r.estado));

  return (
    <section>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-50">Disponibilidad de fechas</h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          Consulta la ocupación horaria de cada espacio antes de aprobar nuevas reservas.
        </p>
      </header>

      <div className="grid gap-4 rounded-2xl border border-ink-200 bg-white p-5 sm:grid-cols-2 dark:border-ink-700 dark:bg-ink-800">
        <Select
          label="Espacio"
          placeholder="Selecciona un espacio"
          value={espacioId}
          onChange={(e) => setEspacioId(e.target.value)}
          options={(espacios ?? []).map((e) => ({ value: String(e.id), label: e.nombre }))}
        />
        <Input label="Fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
      </div>

      <div className="mt-6">
        {!espacioId && (
          <EmptyState icon={CalendarDays} title="Selecciona un espacio" description="Elige un espacio y una fecha para ver su ocupación." />
        )}

        {espacioId && loading && <SkeletonTable rows={5} />}

        {espacioId && !loading && (
          <>
            <div className="mb-4 flex flex-wrap gap-3" aria-label="Leyenda de disponibilidad">
              <Badge tone="success">Libre</Badge>
              <Badge tone="warning">Ocupado</Badge>
            </div>

            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {HORARIO.map((hora) => {
                const bloqueado = ocupado(hora);
                return (
                  <li
                    key={hora}
                    className={
                      bloqueado
                        ? 'flex items-center gap-2 rounded-xl border border-gold-400 bg-amber-50 p-3 text-sm text-amber-900 dark:border-gold-600 dark:bg-amber-950/40 dark:text-amber-100'
                        : 'flex items-center gap-2 rounded-xl border border-jade-300 bg-jade-50 p-3 text-sm text-jade-900 dark:border-jade-700 dark:bg-jade-900/30 dark:text-jade-100'
                    }
                  >
                    {bloqueado ? <CircleSlash aria-hidden="true" className="h-4 w-4" /> : <Clock aria-hidden="true" className="h-4 w-4" />}
                    <span className="font-semibold">{hora}</span>
                    <span className="ml-auto text-xs">{bloqueado ? 'Ocupado' : 'Libre'}</span>
                  </li>
                );
              })}
            </ul>

            <h2 className="mt-8 font-display text-lg font-bold text-ink-900 dark:text-ink-50">Reservas registradas</h2>
            <ul className="mt-4 space-y-2">
              {(reservas ?? []).map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-200 p-4 dark:border-ink-700">
                  <span className="text-sm text-ink-700 dark:text-ink-200">
                    {formatRangoHoras(r.horaInicio, r.horaFin)} · {r.motivo}
                  </span>
                  <Badge tone={BADGE_TONE_BY_ESTADO[r.estado] ?? 'neutral'}>{r.estado}</Badge>
                </li>
              ))}
              {!reservas?.length && <li className="text-sm text-ink-500">Sin reservas para esta fecha.</li>}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}