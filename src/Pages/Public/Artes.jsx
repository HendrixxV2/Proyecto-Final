import { useFetch } from '@/Hooks/useFetch';
import { contenidoService } from '@/Services/contenidoService';
import SectionTitle from '@/Components/Common/SectionTitle';
import EventRecommender from '@/Components/AI/EventRecommender';
import { Skeleton } from '@/Components/UI/Skeleton';

const DISCIPLINAS = [
  { key: 'teatro', titulo: 'Teatro', descripcion: 'Temporadas profesionales, teatro comunitario y formación escénica.', imagen: '/grupoTeatro.jpeg', alt: 'Grupo de teatro del Centro Cultural Orotinense' },
  { key: 'baile', titulo: 'Baile', descripcion: 'Danza folclórica costarricense, contemporánea y proyectos juveniles.', imagen: '/grupoBaile.jpeg', alt: 'Grupo de baile del Centro Cultural Orotinense' },
  { key: 'canto', titulo: 'Canto', descripcion: 'Coro infantil, técnica vocal y repertorio del Pacífico Central.', imagen: '/grupoCanto.jpeg', alt: 'Grupo de canto del Centro Cultural Orotinense' },
];

export default function Artes() {
  const { data, loading } = useFetch(() => contenidoService.list(), []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionTitle
        eyebrow="Programas permanentes"
        title="Teatro · Baile · Canto"
        description="Tres ejes de formación y creación que sostienen la vida artística del centro."
      />

      <div className="mt-10 space-y-14">
        {DISCIPLINAS.map((d) => {
          const bloques = (data ?? []).filter((b) => b.seccion === d.key);
          return (
            <section key={d.key} aria-labelledby={`titulo-${d.key}`}>
              <div className="grid items-start gap-6 lg:grid-cols-[minmax(14rem,0.36fr)_minmax(0,1fr)]">
                <figure className="overflow-hidden rounded-2xl border border-ink-200 bg-ink-100 shadow-sm dark:border-ink-700 dark:bg-ink-800">
                  <img src={d.imagen} alt={d.alt} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                </figure>

                <div>
                  <h2 id={`titulo-${d.key}`} className="font-display text-2xl font-bold text-ink-900 dark:text-ink-50">
                    {d.titulo}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm text-ink-600 dark:text-ink-300">{d.descripcion}</p>

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
  );
}