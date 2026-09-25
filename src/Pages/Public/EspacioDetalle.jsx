import { Link, useParams } from 'react-router-dom';
import { Accessibility, ArrowLeft, Clock, MapPin, Users } from 'lucide-react';
import { useFetch } from '@/Hooks/useFetch';
import { espaciosService } from '@/Services/espaciosService';
import { reservasService } from '@/Services/reservasService';
import Badge from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import Spinner from '@/Components/UI/Spinner';
import ErrorState from '@/Components/UI/ErrorState';
import EmptyState from '@/Components/UI/EmptyState';
import WeatherWidget from '@/Components/Weather/WeatherWidget';
import { formatColones, formatFecha, formatRangoHoras } from '@/Utils/format';
import { BADGE_TONE_BY_ESTADO } from '@/Utils/constants';
import { PATHS } from '@/Routes/paths';

export default function EspacioDetalle() {
  const { id } = useParams();

  const { data: espacio, loading, error, refetch } = useFetch(() => espaciosService.getById(id), [id]);
  const { data: reservas } = useFetch(() => reservasService.listByEspacioYFecha(id, new Date().toISOString().slice(0, 10)), [id]);

  if (loading) return <div className="grid min-h-[60vh] place-items-center"><Spinner label="Cargando espacio…" /></div>;
  if (error) return <div className="mx-auto max-w-3xl px-4 py-12"><ErrorState onRetry={refetch} /></div>;
  if (!espacio) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link to={PATHS.espacios} className="inline-flex items-center gap-2 text-sm text-ink-500 hover:text-brand-600 dark:text-ink-400">
        <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Volver a espacios
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <div className="flex h-64 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-200 to-jade-200 dark:from-brand-900 dark:to-jade-900">
            <span className="font-display text-4xl font-bold text-brand-800/50 dark:text-brand-200/40">
              {espacio.tipo.replace('_', ' ')}
            </span>
          </div>

          <h1 className="mt-6 font-display text-3xl font-bold text-ink-900 dark:text-ink-50">{espacio.nombre}</h1>
          <p className="mt-3 text-base text-ink-600 dark:text-ink-300">{espacio.descripcion}</p>

          <dl className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { Icon: Users, label: 'Capacidad', value: `${espacio.capacidad} personas` },
              { Icon: MapPin, label: 'Ubicación', value: espacio.ubicacion },
              { Icon: Clock, label: 'Tarifa', value: `${formatColones(espacio.precioHora)} / hora` },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="rounded-xl border border-ink-200 p-4 dark:border-ink-700">
                <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">
                  <Icon aria-hidden="true" className="h-3.5 w-3.5" /> {label}
                </dt>
                <dd className="mt-1.5 text-sm font-medium text-ink-800 dark:text-ink-100">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 flex flex-wrap gap-2">
            {espacio.accesible && (
              <Badge tone="success">
                <Accessibility aria-hidden="true" className="h-3.5 w-3.5" /> Accesible para personas con discapacidad
              </Badge>
            )}
            <Badge tone={espacio.activo ? 'success' : 'danger'}>{espacio.activo ? 'Disponible' : 'No disponible'}</Badge>
          </div>

          <div className="mt-8">
            <h2 className="font-display text-xl font-bold text-ink-900 dark:text-ink-50">Reservas de hoy</h2>
            {reservas?.length ? (
              <ul className="mt-4 space-y-2">
                {reservas.map((r) => (
                  <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-200 p-4 dark:border-ink-700">
                    <span className="text-sm text-ink-700 dark:text-ink-200">
                      {formatRangoHoras(r.horaInicio, r.horaFin)} · {r.motivo}
                    </span>
                    <Badge tone={BADGE_TONE_BY_ESTADO[r.estado] ?? 'neutral'}>{r.estado}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4">
                <EmptyState title="Día libre" description="No hay reservas registradas para hoy en este espacio." />
              </div>
            )}
          </div>

          <p className="mt-6 text-xs text-ink-400">Última actualización: {formatFecha(new Date())}</p>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-700 dark:bg-ink-800">
            <h2 className="font-display text-lg font-bold text-ink-900 dark:text-ink-50">¿Te interesa este espacio?</h2>
            <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">
              Envía tu solicitud de reserva y el equipo administrativo la revisará en un plazo de 48 horas.
            </p>
            <Button as={Link} to={`${PATHS.reservas}?espacio=${espacio.id}`} className="mt-4 w-full">
              Solicitar reserva
            </Button>
          </div>

          {espacio.tipo === 'aire_libre' && <WeatherWidget />}
        </aside>
      </div>
    </div>
  );
}