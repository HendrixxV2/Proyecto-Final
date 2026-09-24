import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Landmark, Palette, Ticket, TrainFront } from 'lucide-react';
import { useFetch } from '@/Hooks/useFetch';
import { eventosService } from '@/Services/eventosService';
import { noticiasService } from '@/Services/noticiasService';
import Button from '@/Components/UI/Button';
import SectionTitle from '@/Components/Common/SectionTitle';
import { SkeletonCard } from '@/Components/ui/Skeleton';
import WeatherWidget from '@/Components/weather/WeatherWidget';
import EventRecommender from '@/Components/ai/EventRecommender';
import BlurText from '@/Components/UI/BlurText';
import { formatFecha } from '@/Utils/format';
import { PATHS } from '@/Routes/paths';
import { useLanguage } from '@/Hooks/useLanguage';

const ACCESOS = [
  { to: PATHS.calendario, key: 'calendar', Icon: CalendarDays, tone: 'bg-brand-500' },
  { to: PATHS.espacios, key: 'spaces', Icon: Landmark, tone: 'bg-jade-500' },
  { to: PATHS.boletos, key: 'tickets', Icon: Ticket, tone: 'bg-gold-500' },
  { to: PATHS.galeria, key: 'gallery', Icon: TrainFront, tone: 'bg-ink-700' },
];

export default function Inicio() {
  const { t } = useLanguage();
  const { data: eventos, loading: cargandoEventos } = useFetch(() => eventosService.listPublicados(), []);
  const { data: noticias, loading: cargandoNoticias } = useFetch(() => noticiasService.latest(3), []);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-brand-700 text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_15%_25%,#E9A03B,transparent_45%),radial-gradient(circle_at_85%_75%,#1F6F6B,transparent_45%)]"
        />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:px-8 lg:py-24">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-400">
              {t('home.eyebrow')}
            </p>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              <BlurText text="Centro Cultural Orotinense" delay={90} />
              <span className="mt-2 block text-2xl font-semibold text-brand-100 sm:text-3xl">
                Luis Ferrero Acosta
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base text-brand-50/90 sm:text-lg">
              {t('home.description')}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button as={Link} to={PATHS.calendario} variant="gold" size="lg">
                {t('home.program')}
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Button>
              <Button
                as={Link}
                to={PATHS.reservas}
                size="lg"
                className="border border-white/40 bg-white/10 text-white hover:bg-white/20"
              >
                {t('home.book')}
              </Button>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6">
              {[
                { k: '5', v: t('home.spacesCount') },
                { k: '+120', v: t('home.activities') },
                { k: '1928', v: t('home.heritage') },
              ].map(({ k, v }) => (
                <div key={v}>
                  <dt className="sr-only">{v}</dt>
                  <dd className="font-display text-2xl font-bold sm:text-3xl">{k}</dd>
                  <dd className="text-xs text-brand-100">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <WeatherWidget className="lg:bg-white/95 lg:dark:bg-ink-800/95" />
        </div>
      </section>

      {/* ACCESOS RÁPIDOS */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ACCESOS.map(({ to, key, Icon, tone }) => (
            <li key={to}>
              <Link
                to={to}
                className="group flex h-full flex-col rounded-2xl border border-ink-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-soft dark:border-ink-700 dark:bg-ink-800"
              >
                <span className={`grid h-11 w-11 place-items-center rounded-xl text-white ${tone}`}>
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </span>
                <span className="mt-4 font-display text-base font-semibold text-ink-900 dark:text-ink-50">{t(`home.access.${key}.0`)}</span>
                <span className="mt-1 text-sm text-ink-500 dark:text-ink-400">{t(`home.access.${key}.1`)}</span>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-300">
                  {t('common.explore')} <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* PRÓXIMOS EVENTOS */}
      <section className="bg-white py-14 dark:bg-ink-800/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow={t('home.agenda')}
            title={t('home.upcoming')}
            description={t('home.upcomingDescription')}
          />

          <div className="mt-8">
            {cargandoEventos ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {(eventos ?? []).slice(0, 4).map((e) => (
                  <li key={e.id}>
                    <article className="flex h-full flex-col rounded-2xl border border-ink-200 bg-ink-50 p-5 transition hover:shadow-soft dark:border-ink-700 dark:bg-ink-800">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">
                        {e.categoria}
                      </p>
                      <h3 className="mt-2 font-display text-base font-semibold text-ink-900 dark:text-ink-50">{e.titulo}</h3>
                      <p className="mt-1 flex-1 text-sm text-ink-500 dark:text-ink-400">{e.descripcion}</p>
                      <p className="mt-4 text-xs font-medium text-ink-600 dark:text-ink-300">
                        {formatFecha(e.fecha, "d 'de' MMMM")} · {e.horaInicio}
                      </p>
                    </article>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-8">
            <Button as={Link} to={PATHS.calendario} variant="outline">{t('home.fullCalendar')}</Button>
          </div>
        </div>
      </section>

      {/* RECOMENDACIONES IA */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow={t('home.ai')}
          title={t('home.recommended')}
          description={t('home.recommendedDescription')}
        />
        <div className="mt-8">
          <EventRecommender limite={3} />
        </div>
      </section>

      {/* NOTICIAS */}
      <section className="bg-white py-14 dark:bg-ink-800/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow={t('home.current')} title={t('home.centerNews')} />

          <ul className="mt-8 grid gap-5 lg:grid-cols-3">
            {cargandoNoticias
              ? Array.from({ length: 3 }).map((_, i) => <li key={i}><SkeletonCard /></li>)
              : (noticias ?? []).map((n) => (
                  <li key={n.id}>
                    <article className="flex h-full flex-col rounded-2xl border border-ink-200 p-5 dark:border-ink-700">
                      <p className="text-xs text-ink-500 dark:text-ink-400">{formatFecha(n.fecha)}</p>
                      <h3 className="mt-2 font-display text-lg font-semibold text-ink-900 dark:text-ink-50">{n.titulo}</h3>
                      <p className="mt-2 flex-1 text-sm text-ink-600 dark:text-ink-300">{n.resumen}</p>
                      <Link
                        to={PATHS.noticiaDetalle(n.id)}
                        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-300"
                      >
                        Leer más <ArrowRight aria-hidden="true" className="h-4 w-4" />
                      </Link>
                    </article>
                  </li>
                ))}
          </ul>

          <div className="mt-8">
            <Button as={Link} to={PATHS.noticias} variant="outline">{t('home.allNews')}</Button>
          </div>
        </div>
      </section>

      {/* HISTORIA CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 rounded-2xl bg-jade-700 p-8 text-white sm:p-12 lg:grid-cols-2">
          <div>
            <Palette aria-hidden="true" className="h-8 w-8 text-jade-200" />
            <h2 className="mt-4 font-display text-2xl font-bold sm:text-3xl">{t('home.legacy')}</h2>
            <p className="mt-3 text-sm text-jade-100 sm:text-base">{t('home.legacyDescription')}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button as={Link} to={PATHS.historia} variant="gold">{t('home.learnHistory')}</Button>
              <Button as={Link} to={PATHS.galeria} className="border border-white/40 bg-white/10 text-white hover:bg-white/20">
                {t('home.viewGallery')}
              </Button>
            </div>
          </div>

          <ul className="grid grid-cols-2 gap-4">
            {[
              { key: 'theater' },
              { key: 'dance' },
              { key: 'singing' },
              { key: 'visual' },
            ].map(({ key }) => (
              <li key={key} className="rounded-xl bg-white/10 p-4">
                <p className="font-display text-sm font-bold">{t(`home.disciplines.${key}.0`)}</p>
                <p className="mt-1 text-xs text-jade-100">{t(`home.disciplines.${key}.1`)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}