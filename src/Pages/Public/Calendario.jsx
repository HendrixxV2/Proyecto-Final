import { useMemo, useState } from 'react';
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek, subMonths } from 'date-fns';
import { enUS, es, zhTW } from 'date-fns/locale';
import { CalendarDays, ChevronLeft, ChevronRight, Ticket } from 'lucide-react';
import { useFetch } from '@/Hooks/useFetch';
import { eventosService } from '@/Services/eventosService';
import Button from '@/Components/UI/Button';
import Badge from '@/Components/UI/Badge';
import SectionTitle from '@/Components/Common/SectionTitle';
import EmptyState from '@/Components/UI/EmptyState';
import { formatRangoHoras, formatColones } from '@/Utils/format';
import { CATEGORIAS_EVENTO } from '@/Utils/constants';
import { cn } from '@/Utils/cn';
import { useLanguage } from '@/Hooks/useLanguage';

export default function Calendario() {
  const { language, t } = useLanguage();
  const locale = language === 'en' ? enUS : language === 'zh' ? zhTW : es;
  const categoryLabels = {
    teatro: { es: 'Teatro', en: 'Theater', zh: '戲劇' },
    baile: { es: 'Baile', en: 'Dance', zh: '舞蹈' },
    canto: { es: 'Canto', en: 'Song', zh: '歌唱' },
    exposicion: { es: 'Exposición', en: 'Exhibition', zh: '展覽' },
    taller: { es: 'Taller', en: 'Workshop', zh: '工作坊' },
    cine: { es: 'Cine', en: 'Film', zh: '電影' },
  };
  const [mesActual, setMesActual] = useState(new Date());
  const [categoria, setCategoria] = useState('todas');
  const [seleccionado, setSeleccionado] = useState(new Date());

  const { data: eventos, loading } = useFetch(() => eventosService.listPublicados(), []);

  const filtrados = useMemo(
    () => (eventos ?? []).filter((e) => categoria === 'todas' || e.categoria === categoria),
    [eventos, categoria],
  );

  const dias = useMemo(() => {
    const inicio = startOfWeek(startOfMonth(mesActual), { weekStartsOn: 1 });
    const fin = endOfWeek(endOfMonth(mesActual), { weekStartsOn: 1 });
    return eachDayOfInterval({ start: inicio, end: fin });
  }, [mesActual]);

  const eventosDelDia = (dia) => filtrados.filter((e) => isSameDay(new Date(`${e.fecha}T12:00:00`), dia));
  const eventosSeleccionados = eventosDelDia(seleccionado);

  return (
    <div className="relative isolate overflow-hidden bg-ink-50 dark:bg-ink-900">
      <div aria-hidden="true" className="absolute inset-0 bg-cover bg-center opacity-75" style={{ backgroundImage: "url('/fondoCalendario.jpeg')" }} />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-white/55 via-white/45 to-jade-50/45 dark:from-ink-900/80 dark:via-ink-900/75 dark:to-jade-950/70" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionTitle
        eyebrow={t('calendar.eyebrow')}
        title={t('calendar.title')}
        description={t('calendar.description')}
      />

      {/* Filtros */}
      <div className="mt-8 flex flex-wrap items-center gap-2" role="group" aria-label={t('calendar.category')}>
        <button
          type="button"
          onClick={() => setCategoria('todas')}
          aria-pressed={categoria === 'todas'}
          className={cn(
            'rounded-full px-3.5 py-1.5 text-xs font-semibold transition',
            categoria === 'todas' ? 'bg-brand-500 text-white' : 'border border-ink-300 text-ink-600 dark:border-ink-600 dark:text-ink-300',
          )}
        >
          {t('calendar.all')}
        </button>
        {CATEGORIAS_EVENTO.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategoria(c)}
            aria-pressed={categoria === c}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition',
              categoria === c ? 'bg-brand-500 text-white' : 'border border-ink-300 text-ink-600 dark:border-ink-600 dark:text-ink-300',
            )}
          >
            {categoryLabels[c]?.[language] ?? c}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        {/* Grilla del calendario */}
        <section aria-label={`${t('calendar.title')}: ${format(mesActual, 'MMMM yyyy', { locale })}`} className="rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-700 dark:bg-ink-800">
          <header className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold capitalize text-ink-900 dark:text-ink-50">
              {format(mesActual, 'MMMM yyyy', { locale })}
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => setMesActual((m) => subMonths(m, 1))} aria-label={t('calendar.previous')}>
                <ChevronLeft aria-hidden="true" className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setMesActual((m) => addMonths(m, 1))} aria-label={t('calendar.next')}>
                <ChevronRight aria-hidden="true" className="h-4 w-4" />
              </Button>
            </div>
          </header>

          <div className="mt-5 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wide text-ink-400">
            {(language === 'en' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : language === 'zh' ? ['一', '二', '三', '四', '五', '六', '日'] : ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom']).map((d) => <div key={d}>{d}</div>)}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-1">
            {dias.map((dia) => {
              const delDia = eventosDelDia(dia);
              const fueraDeMes = !isSameMonth(dia, mesActual);
              const activo = isSameDay(dia, seleccionado);

              return (
                <button
                  key={dia.toISOString()}
                  type="button"
                  onClick={() => setSeleccionado(dia)}
                  aria-pressed={activo}
                  aria-label={`${format(dia, language === 'zh' ? 'M月d日' : language === 'en' ? 'MMMM d' : "d 'de' MMMM", { locale })}${delDia.length ? `, ${t('calendar.event', { count: delDia.length })}` : ''}`}
                  className={cn(
                    'relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition',
                    fueraDeMes && 'opacity-40',
                    activo
                      ? 'bg-brand-500 text-white'
                      : 'text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-700',
                  )}
                >
                  <span>{format(dia, 'd')}</span>
                  {delDia.length > 0 && (
                    <span
                      aria-hidden="true"
                      className={cn('mt-1 h-1.5 w-1.5 rounded-full', activo ? 'bg-white' : 'bg-gold-500')}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Detalle del día */}
        <section aria-label={t('calendar.selectedEvents')} className="rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-700 dark:bg-ink-800">
          <h3 className="font-display text-lg font-bold text-ink-900 dark:text-ink-50">
            {format(seleccionado, language === 'zh' ? 'M月d日 EEEE' : language === 'en' ? 'EEEE, MMMM d' : "EEEE d 'de' MMMM", { locale })}
          </h3>

          {loading && <p className="mt-4 text-sm text-ink-500">{t('calendar.loading')}</p>}

          {!loading && eventosSeleccionados.length === 0 && (
            <div className="mt-5">
              <EmptyState icon={CalendarDays} title={t('calendar.empty')} description={t('calendar.emptyDescription')} />
            </div>
          )}

          <ul className="mt-5 space-y-4">
            {eventosSeleccionados.map((e) => (
              <li key={e.id} className="rounded-xl border border-ink-200 p-4 dark:border-ink-700">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-display text-base font-semibold text-ink-900 dark:text-ink-50">{e.titulo}</h4>
                  <Badge tone="info">{categoryLabels[e.categoria]?.[language] ?? e.categoria}</Badge>
                </div>
                <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">{e.descripcion}</p>
                <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-500 dark:text-ink-400">
                  <div className="flex gap-1.5">
                    <dt className="font-semibold">{t('calendar.time')}</dt>
                    <dd>{formatRangoHoras(e.horaInicio, e.horaFin)}</dd>
                  </div>
                  <div className="flex gap-1.5">
                    <dt className="font-semibold">{t('calendar.admission')}</dt>
                    <dd>{e.precio > 0 ? formatColones(e.precio) : t('calendar.free')}</dd>
                  </div>
                </dl>
                <Button as="a" href="/boletos" size="sm" variant="outline" className="mt-4">
                  <Ticket aria-hidden="true" className="h-4 w-4" />
                  {t('calendar.book')}
                </Button>
              </li>
            ))}
          </ul>
        </section>
      </div>
      </div>
    </div>
  );
}