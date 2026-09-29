import { useFetch } from '@/Hooks/useFetch';
import { contenidoService } from '@/Services/contenidoService';
import SectionTitle from '@/Components/Common/SectionTitle';
import EventRecommender from '@/Components/AI/EventRecommender';
import { Skeleton } from '@/Components/UI/Skeleton';

const DISCIPLINAS = [
  { key: 'teatro', titulo: 'Teatro', descripcion: 'Temporadas profesionales, teatro comunitario y formación escénica.', imagen: '/grupoTeatro.jpeg', alt: 'Grupo de teatro del Centro Cultural Orotinense', inicio: '5 de octubre de 2026', fecha: '2026-10-05' },
  { key: 'baile', titulo: 'Baile', descripcion: 'Danza folclórica costarricense, contemporánea y proyectos juveniles.', imagen: '/grupoBaile.jpeg', alt: 'Grupo de baile del Centro Cultural Orotinense', inicio: '12 de octubre de 2026', fecha: '2026-10-12' },
  { key: 'canto', titulo: 'Canto', descripcion: 'Coro infantil, técnica vocal y repertorio del Pacífico Central.', imagen: '/grupoCanto.jpeg', alt: 'Grupo de canto del Centro Cultural Orotinense', inicio: '19 de octubre de 2026', fecha: '2026-10-19' },
];

export default function Artes() {
  const { data, loading } = useFetch(() => contenidoService.list(), []);

  return (
    <div className="relative isolate overflow-hidden bg-ink-50 dark:bg-ink-900">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.14]"
        style={{ backgroundImage: "url('/vista200.jpeg')" }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink-50/90 via-ink-50/80 to-ink-50/95 dark:from-ink-900/90 dark:via-ink-900/85 dark:to-ink-900/95" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Programas permanentes"
          title="Teatro · Baile · Canto"
          description="Tres ejes de formación y creación que sostienen la vida artística del centro."
        />

      <div className="mt-10 space-y-14">
        {DISCIPLINAS.map((d, index) => {
          const bloques = (data ?? []).filter((b) => b.seccion === d.key);
          return (
            <section key={d.key} aria-labelledby={`titulo-${d.key}`}>
              <div className="grid items-start gap-6 lg:items-center lg:grid-cols-[minmax(18rem,0.7fr)_minmax(0,1.3fr)] lg:gap-8 xl:items-stretch xl:grid-cols-[minmax(22rem,0.85fr)_minmax(0,1.15fr)] xl:gap-12">
                <figure className={`group relative isolate overflow-hidden rounded-2xl border border-ink-200 bg-ink-100 shadow-sm dark:border-ink-700 dark:bg-ink-800 xl:min-h-[32rem] ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <img
                    src={d.imagen}
                    alt={d.alt}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 xl:absolute xl:inset-0 xl:h-full xl:aspect-auto"
                  />
                  <span aria-hidden="true" className="absolute bottom-3 left-3 rounded-md bg-ink-950/75 px-2.5 py-1 font-mono text-xs font-semibold text-white backdrop-blur-sm">
                    {String(index + 1).padStart(2, '0')} / {String(DISCIPLINAS.length).padStart(2, '0')}
                  </span>
                </figure>

                <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                  <h2 id={`titulo-${d.key}`} className="font-display text-2xl font-bold text-ink-900 dark:text-ink-50">
                    {d.titulo}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm text-ink-600 dark:text-ink-300">{d.descripcion}</p>
                  <p className="mt-3 text-sm text-ink-600 dark:text-ink-300">
                    <span className="font-semibold text-ink-800 dark:text-ink-100">Fecha ilustrativa de inicio: </span>
                    <time dateTime={d.fecha}>{d.inicio}</time>
                  </p>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {loading
                      ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)
                      : bloques.map((b) => (
                          <article key={b.id} className="rounded-2xl border border-ink-200 p-5 dark:border-ink-700">
                            <h3 className="font-display text-base font-semibold text-ink-900 dark:text-ink-50">{b.titulo}</h3>
                            <p className="mt-1.5 text-sm text-ink-600 dark:text-ink-300">{b.cuerpo}</p>
                          </article>
                        ))}
                  </div>

                  <div className="mt-6">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-jade-600 dark:text-jade-300">
                      Actividades recomendadas de {d.titulo.toLowerCase()}
                    </p>
                    <EventRecommender categoria={d.key} limite={3} />
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>
      </div>
    </div>
  );
}