import { CalendarX2 } from 'lucide-react';
import { useAuth } from '@/Hooks/useAuth';
import { useFetch } from '@/Hooks/useFetch';
import { useToast } from '@/Hooks/useToast';
import { reservasService } from '@/Services/reservasService';
import { espaciosService } from '@/Services/espaciosService';
import SectionTitle from '@/Components/Common/SectionTitle';
import { SkeletonTable } from '@/Components/UI/Skeleton';
import ErrorState from '@/Components/UI/ErrorState';
import EmptyState from '@/Components/UI/EmptyState';
import Badge from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { formatFecha, formatRangoHoras } from '@/Utils/format';
import { BADGE_TONE_BY_ESTADO } from '@/Utils/constants';

export default function MisReservas() {
  const { user } = useAuth();
  const toast = useToast();

  const { data: reservas, loading, error, refetch } = useFetch(() => reservasService.listByUsuario(user.id), [user.id]);
  const { data: espacios } = useFetch(() => espaciosService.list(), []);

  const nombreEspacio = (id) => espacios?.find((e) => e.id === id)?.nombre ?? `Espacio #${id}`;

  const cancelar = async (id) => {
    try {
      await reservasService.cancelar(id);
      toast.success('Reserva cancelada', 'Tu reserva fue cancelada correctamente.');
      refetch();
    } catch (err) {
      toast.error('No se pudo cancelar', err.message);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionTitle eyebrow="Mi cuenta" title="Mis reservas" description="Consulta el estado de tus solicitudes de espacio." />

      <div className="mt-8">
        {loading && <SkeletonTable rows={4} />}
        {error && !loading && <ErrorState onRetry={refetch} />}

        {!loading && !error && reservas?.length === 0 && (
          <EmptyState
            icon={CalendarX2}
            title="Aún no tienes reservas"
            description="Cuando solicites un espacio, aparecerá aquí con su estado de aprobación."
          />
        )}

        {!loading && !error && reservas?.length > 0 && (
          <ul className="space-y-3">
            {reservas.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-700 dark:bg-ink-800">
                <div>
                  <h3 className="font-display text-base font-semibold text-ink-900 dark:text-ink-50">{nombreEspacio(r.espacioId)}</h3>
                  <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
                    {formatFecha(r.fecha)} · {formatRangoHoras(r.horaInicio, r.horaFin)}
                  </p>
                  <p className="mt-1 text-xs text-ink-400">{r.motivo}</p>
                </div>

                <div className="flex items-center gap-3">
                  <Badge tone={BADGE_TONE_BY_ESTADO[r.estado] ?? 'neutral'}>{r.estado}</Badge>
                  {['pendiente', 'aprobada'].includes(r.estado) && (
                    <Button variant="outline" size="sm" onClick={() => cancelar(r.id)}>Cancelar</Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}