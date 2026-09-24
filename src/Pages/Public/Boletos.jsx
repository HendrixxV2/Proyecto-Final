import { useState } from 'react';
import { Ticket } from 'lucide-react';
import { useFetch } from '@/Hooks/useFetch';
import { useAuth } from '@/Hooks/useAuth';
import { useToast } from '@/Hooks/useToast';
import { eventosService } from '@/Services/eventosService';
import { boletosService } from '@/Services/boletosService';
import SectionTitle from '@/Components/common/SectionTitle';
import Badge from '@/Components/ui/Badge';
import Button from '@/Components/ui/Button';
import { SkeletonCard } from '@/Components/ui/Skeleton';
import EmptyState from '@/Components/ui/EmptyState';
import { formatColones, formatFecha, formatHora } from '@/Utils/format';

export default function Boletos() {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const [procesando, setProcesando] = useState(null);

  const { data: eventos, loading } = useFetch(() => eventosService.listPublicados(), []);
  const { data: misBoletos, refetch } = useFetch(
    () => (user ? boletosService.listByUsuario(user.id) : Promise.resolve([])),
    [user?.id],
  );

  const reservar = async (evento) => {
    if (!isAuthenticated) {
      toast.info('Inicia sesión', 'Debes ingresar para reservar boletos.');
      return;
    }

    setProcesando(evento.id);
    try {
      await boletosService.reservar(evento.id, user.id, evento.precio);
      toast.success('Boleto reservado', `Tu entrada para "${evento.titulo}" quedó reservada.`);
      refetch();
    } catch (err) {
      toast.error('No se pudo reservar', err.message);
    } finally {
      setProcesando(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionTitle
        eyebrow="Entradas"
        title="Boletos en línea"
        description="Reserva tu entrada para las actividades del Centro Cultural Orotinense."
      />

      {loading && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!loading && (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(eventos ?? []).map((e) => {
            const reservado = misBoletos?.some((b) => b.eventoId === e.id);
            return (
              <li key={e.id}>
                <article className="flex h-full flex-col rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-700 dark:bg-ink-800">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">{e.categoria}</p>
                    <Badge tone={e.precio > 0 ? 'info' : 'success'}>{e.precio > 0 ? formatColones(e.precio) : 'Gratuito'}</Badge>
                  </div>

                  <h3 className="mt-2 font-display text-lg font-semibold text-ink-900 dark:text-ink-50">{e.titulo}</h3>
                  <p className="mt-1.5 flex-1 text-sm text-ink-500 dark:text-ink-400">{e.descripcion}</p>

                  <p className="mt-4 text-xs text-ink-600 dark:text-ink-300">
                    {formatFecha(e.fecha)} · {formatHora(e.horaInicio)}
                  </p>
                  <p className="text-xs text-ink-400">Aforo: {e.aforo} personas</p>

                  <Button
                    className="mt-5 w-full"
                    onClick={() => reservar(e)}
                    loading={procesando === e.id}
                    disabled={reservado}
                    variant={reservado ? 'outline' : 'primary'}
                  >
                    <Ticket aria-hidden="true" className="h-4 w-4" />
                    {reservado ? 'Ya tienes tu boleto' : 'Reservar boleto'}
                  </Button>
                </article>
              </li>
            );
          })}
        </ul>
      )}

      {!loading && !eventos?.length && (
        <div className="mt-8">
          <EmptyState icon={Ticket} title="Sin eventos con boletos" description="Vuelve pronto para conocer nuevas funciones." />
        </div>
      )}
    </div>
  );
}