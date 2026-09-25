import { useFetch } from '@/Hooks/useFetch';
import { contenidoService } from '@/Services/contenidoService';
import SectionTitle from '@/Components/Common/SectionTitle';
import EventRecommender from '@/Components/AI/EventRecommender';
import { Skeleton } from '@/Components/UI/Skeleton';

const DISCIPLINAS = [
  { key: 'teatro', titulo: 'Teatro', descripcion: 'Temporadas profesionales, teatro comunitario y formación escénica.' },
  { key: 'baile', titulo: 'Baile', descripcion: 'Danza folclórica costarricense, contemporánea y proyectos juveniles.' },
  { key: 'canto', titulo: 'Canto', descripcion: 'Coro infantil, técnica vocal y repertorio del Pacífico Central.' },
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
            </section>
          );
        })}
      </div>
    </div>
  );
}