import { Fragment, useState } from 'react';
import { Armchair, CalendarDays, Search, Ticket } from 'lucide-react';
import { useFetch } from '@/Hooks/useFetch';
import { useAuth } from '@/Hooks/useAuth';
import { useToast } from '@/Hooks/useToast';
import { eventosService } from '@/Services/eventosService';
import { boletosService } from '@/Services/boletosService';
import SectionTitle from '@/Components/Common/SectionTitle';
import Badge from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import Input from '@/Components/UI/Input';
import Modal from '@/Components/UI/Modal';
import { SkeletonCard } from '@/Components/UI/Skeleton';
import EmptyState from '@/Components/UI/EmptyState';
import { formatColones, formatFecha, formatHora } from '@/Utils/format';
import { useLanguage } from '@/Hooks/useLanguage';

const COLUMNAS_BUTACA = 4;
const nombreButaca = (indice) =>
  `${String.fromCharCode(65 + Math.floor(indice / COLUMNAS_BUTACA))}${(indice % COLUMNAS_BUTACA) + 1}`;

export default function Boletos() {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const { t } = useLanguage();
  const [procesando, setProcesando] = useState(null);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [butacasSeleccionadas, setButacasSeleccionadas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('todas');

  const { data: eventos, loading } = useFetch(() => eventosService.listPublicados(), []);
  const { data: boletos, loading: cargandoBoletos, refetch: refetchBoletos } = useFetch(
    () => boletosService.list(),
    [],
  );
  const { data: misBoletos, refetch } = useFetch(
    () => (user ? boletosService.listByUsuario(user.id) : Promise.resolve([])),
    [user?.id],
  );

  const reservar = async () => {
    const evento = eventoSeleccionado;
    if (!evento) return;
    if (!isAuthenticated) {
      toast.info(t('tickets.signIn'), t('tickets.signInDescription'));
      return;
    }

    setProcesando(evento.id);
    try {
      const reservados = await boletosService.reservar(evento.id, user.id, evento.precio, butacasSeleccionadas);
      toast.success(
        reservados.length === 1 ? t('tickets.reserved') : t('tickets.reservedPlural'),
        `${reservados.length} ${reservados.length === 1 ? t('tickets.ticketUnit') : t('tickets.ticketUnitPlural')} para "${evento.titulo}".`,
      );
      setEventoSeleccionado(null);
      setButacasSeleccionadas([]);
      await Promise.all([refetch(), refetchBoletos()]);
    } catch (err) {
      toast.error(t('tickets.reservationError'), err.message);
    } finally {
      setProcesando(null);
    }
  };

  const categorias = [...new Set((eventos ?? []).map((evento) => evento.categoria).filter(Boolean))];
  const eventosFiltrados = (eventos ?? []).filter((evento) => {
    const coincideBusqueda = `${evento.titulo} ${evento.descripcion} ${evento.categoria}`
      .toLocaleLowerCase('es')
      .includes(busqueda.toLocaleLowerCase('es'));
    return coincideBusqueda && (categoria === 'todas' || evento.categoria === categoria);
  });
  const boletosDeEvento = (eventoId) =>
    (boletos ?? [])
      .filter((boleto) => String(boleto.eventoId) === String(eventoId))
      .sort((a, b) => Number(a.id) - Number(b.id));
  const disponiblesPorEvento = (eventoId) =>
    boletosDeEvento(eventoId).filter((boleto) => boleto.estado === 'disponible').length;
  const asientosDeEvento = (eventoId) => {
    const boletosSala = boletosDeEvento(eventoId);
    const asientosUsados = new Set(boletosSala.map((boleto) => boleto.asiento).filter(Boolean));
    let siguienteIndice = 0;
    return boletosSala.map((boleto) => {
      if (boleto.asiento) return { ...boleto, asiento: boleto.asiento };
      let asiento = nombreButaca(siguienteIndice);
      while (asientosUsados.has(asiento)) asiento = nombreButaca(++siguienteIndice);
      asientosUsados.add(asiento);
      siguienteIndice += 1;
      return { ...boleto, asiento };
    }).sort((a, b) => a.asiento.localeCompare(b.asiento, 'es', { numeric: true }));
  };
  const asientosSala = eventoSeleccionado ? asientosDeEvento(eventoSeleccionado.id) : [];
  const filasSala = [...new Set(asientosSala.map((boleto) => boleto.asiento.slice(0, -1)))];
  const total = Number(eventoSeleccionado?.precio ?? 0) * butacasSeleccionadas.length;
  const cerrarSelector = () => {
    if (procesando) return;
    setEventoSeleccionado(null);
    setButacasSeleccionadas([]);
  };
  const alternarButaca = (boleto) => {
    setButacasSeleccionadas((actuales) => actuales.some((item) => item.id === boleto.id)
      ? actuales.filter((item) => item.id !== boleto.id)
      : [...actuales, { id: boleto.id, asiento: boleto.asiento }]);
  };

  return (
    <div className="relative isolate overflow-hidden bg-ink-50 dark:bg-ink-900">
      <div aria-hidden="true" className="absolute inset-0 bg-center opacity-[0.36]" style={{ backgroundImage: "url('/fondoBoletos.jpg')", backgroundSize: '100% 100%' }} />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-white/85 via-white/80 to-jade-50/70 dark:from-ink-900/95 dark:via-ink-900/90 dark:to-jade-950/85" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionTitle
        eyebrow={t('tickets.eyebrow')}
        title={t('tickets.title')}
        description={t('tickets.description')}
      />

      <div className="mt-8 grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
        <div className="relative">
          <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-[38px] h-4 w-4 text-ink-400" />
          <Input
            label={t('tickets.search')}
            placeholder={t('tickets.searchPlaceholder')}
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            className="pl-10"
          />
        </div>
        <label className="block text-sm font-medium text-ink-800 dark:text-ink-200">
          {t('tickets.category')}
          <select
            value={categoria}
            onChange={(event) => setCategoria(event.target.value)}
            className="mt-1.5 h-11 w-full rounded-xl border border-ink-300 bg-white px-3.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 dark:border-ink-600 dark:bg-ink-800 dark:text-ink-100"
          >
            <option value="todas">{t('tickets.all')}</option>
            {categorias.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
      </div>

      {loading && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!loading && (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {eventosFiltrados.map((evento) => {
            const boletosPropios = misBoletos?.filter((boleto) => String(boleto.eventoId) === String(evento.id)) ?? [];
            const disponibles = disponiblesPorEvento(evento.id);
            return (
              <li key={evento.id}>
                <article className="tarjeta-cultural flex h-full flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-jade-300">{evento.categoria}</p>
                    <Badge tone={evento.precio > 0 ? 'info' : 'success'}>{evento.precio > 0 ? formatColones(evento.precio) : t('tickets.free')}</Badge>
                  </div>

                  <h3 className="mt-2 font-display text-lg font-semibold text-white">{evento.titulo}</h3>
                  <p className="mt-1.5 flex-1 text-sm text-white/75">{evento.descripcion}</p>

                  <div className="mt-4 flex items-center gap-2 text-xs text-white/80">
                    <CalendarDays aria-hidden="true" className="h-4 w-4 shrink-0" />
                    <span>{formatFecha(evento.fecha)} · {formatHora(evento.horaInicio)}</span>
                  </div>
                  <p className="mt-2 text-xs text-white/75">
                    {cargandoBoletos
                      ? t('tickets.checking')
                      : disponibles > 0
                        ? t(disponibles === 1 ? 'tickets.available' : 'tickets.availablePlural', { count: disponibles })
                        : t('tickets.soldOut')}
                    {evento.aforo ? ` · ${t('tickets.category')} ${evento.aforo}` : ''}
                  </p>
                  {boletosPropios.length > 0 && (
                    <p className="mt-1 text-xs font-medium text-jade-200">
                      {t('tickets.alreadyBooked', { count: boletosPropios.length, unit: boletosPropios.length === 1 ? t('tickets.ticketUnit') : t('tickets.ticketUnitPlural') })}
                    </p>
                  )}

                  <Button
                    className="mt-5 w-full"
                    onClick={() => { setEventoSeleccionado(evento); setButacasSeleccionadas([]); }}
                    disabled={cargandoBoletos || disponibles === 0}
                    variant={!cargandoBoletos && disponibles === 0 ? 'outline' : 'primary'}
                  >
                    <Ticket aria-hidden="true" className="h-4 w-4" />
                    {cargandoBoletos ? t('tickets.checkingSeats') : disponibles === 0 ? t('tickets.soldOutShort') : t('tickets.choose')}
                  </Button>
                </article>
              </li>
            );
          })}
        </ul>
      )}

      {!loading && !eventos?.length && (
        <div className="mt-8">
          <EmptyState icon={Ticket} title={t('tickets.noActivities')} description={t('tickets.noActivitiesDescription')} />
        </div>
      )}

      {!loading && eventos?.length > 0 && eventosFiltrados.length === 0 && (
        <div className="mt-8">
          <EmptyState icon={Search} title={t('tickets.noResults')} description={t('tickets.noResultsDescription')} />
        </div>
      )}

      {isAuthenticated && misBoletos?.length > 0 && (
        <section className="mt-14 border-t border-ink-200 pt-8 dark:border-ink-700" aria-labelledby="mis-entradas-title">
          <h2 id="mis-entradas-title" className="font-display text-xl font-semibold text-ink-900 dark:text-ink-50">{t('tickets.yourTickets')}</h2>
          <ul className="mt-4 divide-y divide-ink-200 dark:divide-ink-700">
            {misBoletos.map((boleto) => {
              const evento = eventos?.find((item) => String(item.id) === String(boleto.eventoId));
              return (
                <li key={boleto.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm font-medium text-ink-900 dark:text-ink-100">{evento?.titulo ?? `Actividad #${boleto.eventoId}`}</p>
                    <p className="mt-0.5 font-mono text-xs text-ink-500 dark:text-ink-400">
                      {boleto.codigo}{boleto.asiento ? ` · ${t('tickets.seat')} ${boleto.asiento}` : ''}
                    </p>
                  </div>
                  <Badge tone={boleto.estado === 'pagado' ? 'success' : 'warning'}>{boleto.estado}</Badge>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <Modal
        open={Boolean(eventoSeleccionado)}
        onClose={cerrarSelector}
        title={t('tickets.chooseSeats')}
        description={eventoSeleccionado?.titulo}
        size="lg"
        footer={(
          <>
            <Button variant="outline" onClick={cerrarSelector} disabled={Boolean(procesando)}>{t('tickets.back')}</Button>
            <Button onClick={reservar} loading={procesando === eventoSeleccionado?.id} disabled={butacasSeleccionadas.length === 0}>
              {total > 0 ? t('tickets.reserve') : t('tickets.confirm')}
            </Button>
          </>
        )}
      >
        {eventoSeleccionado && (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-ink-600 dark:text-ink-300">{formatFecha(eventoSeleccionado.fecha)} · {formatHora(eventoSeleccionado.horaInicio)}</span>
              <span className="font-medium text-ink-900 dark:text-ink-100">{eventoSeleccionado.precio > 0 ? `${formatColones(eventoSeleccionado.precio)} ${t('tickets.perTicket')}` : t('tickets.freeTicket')}</span>
            </div>
            <div>
              <div className="mx-auto max-w-sm rounded-t-[50%] border-b-4 border-cielo-300 bg-cielo-700 px-4 py-2 text-center text-xs font-semibold tracking-wide text-white shadow-[0_8px_24px_-12px_rgba(0,114,178,0.9)]">
                {t('tickets.screen')}
              </div>
              <div className="mt-4 rounded-lg bg-ink-900 p-4 text-ink-100 sm:p-5">
                <div className="max-h-64 space-y-3 overflow-y-auto" aria-label={t('tickets.seatsMap')}>
                  {filasSala.map((fila) => (
                    <div key={fila} className="grid grid-cols-[1rem_repeat(2,minmax(0,1fr))_1.25rem_repeat(2,minmax(0,1fr))] items-center gap-2">
                      <span className="text-center text-xs font-semibold text-ink-300">{fila}</span>
                      {asientosSala.filter((boleto) => boleto.asiento.startsWith(fila)).map((boleto) => {
                        const seleccionado = butacasSeleccionadas.some((item) => item.id === boleto.id);
                        const disponible = boleto.estado === 'disponible';
                        const columna = Number(boleto.asiento.slice(fila.length));
                        return (
                          <Fragment key={boleto.id}>
                            {columna === 3 && <span aria-hidden="true" />}
                            <button
                              type="button"
                              aria-label={`Butaca ${boleto.asiento}, ${seleccionado ? 'seleccionada' : disponible ? 'disponible' : 'ocupada'}`}
                              aria-pressed={seleccionado}
                              title={`Butaca ${boleto.asiento}`}
                              disabled={!disponible}
                              onClick={() => alternarButaca(boleto)}
                              className={`flex aspect-square min-h-10 flex-col items-center justify-center gap-0.5 rounded-md border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                                seleccionado
                                  ? 'border-gold-400 bg-gold-500 text-ink-900'
                                  : disponible
                                    ? 'border-jade-400 bg-jade-700 text-white hover:bg-jade-600'
                                    : 'cursor-not-allowed border-ink-600 bg-ink-700 text-ink-400'
                              }`}
                            >
                              <Armchair aria-hidden="true" className="h-4 w-4" />
                              <span className="text-[10px] font-semibold leading-none">{boleto.asiento}</span>
                            </button>
                          </Fragment>
                        );
                      })}
                    </div>
                  ))}
                  {asientosSala.length === 0 && <p className="py-6 text-center text-sm text-ink-300">No hay butacas emitidas para esta función.</p>}
                </div>
                <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 border-t border-ink-700 pt-3 text-xs text-ink-200" aria-label="Estados de butacas">
                  <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm border border-jade-400 bg-jade-700" aria-hidden="true" />Disponible</span>
                  <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm border border-gold-400 bg-gold-500" aria-hidden="true" />Seleccionada</span>
                  <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm border border-ink-600 bg-ink-700" aria-hidden="true" />Ocupada</span>
                </div>
              </div>
              <p className="mt-2 text-center text-xs text-ink-500 dark:text-ink-400" aria-live="polite">
                {butacasSeleccionadas.length} seleccionadas · {disponiblesPorEvento(eventoSeleccionado.id)} disponibles
              </p>
            </div>
            <div className="flex items-center justify-between border-t border-ink-200 pt-4 text-sm dark:border-ink-700">
              <span className="text-ink-600 dark:text-ink-300">Total de la reserva</span>
              <strong className="text-base text-ink-900 dark:text-ink-50">{formatColones(total)}</strong>
            </div>
          </div>
        )}
      </Modal>
      </div>
    </div>
  );
}