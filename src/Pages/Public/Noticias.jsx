import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useFetch } from '@/Hooks/useFetch';
import { noticiasService } from '@/Services/noticiasService';
import SectionTitle from '@/Components/Common/SectionTitle';
import { SkeletonCard } from '@/Components/UI/Skeleton';
import EmptyState from '@/Components/UI/EmptyState';
import { formatFecha } from '@/Utils/format';
import { PATHS } from '@/Routes/paths';

export default function Noticias() {
  const { data, loading } = useFetch(() => noticiasService.list({ _sort: 'fecha', _order: 'desc' }), []);

  return (
    <div className="relative isolate overflow-hidden bg-ink-50 dark:bg-ink-900">
      <div aria-hidden="true" className="absolute inset-0 bg-center opacity-[0.36]" style={{ backgroundImage: "url('/fondoNoticias.jpeg')", backgroundSize: '100% 100%' }} />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-white/85 via-white/80 to-jade-50/70 dark:from-ink-900/95 dark:via-ink-900/90 dark:to-jade-950/85" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionTitle eyebrow="Sala de prensa" title="Noticias" description="Comunicados, convocatorias y novedades del centro." />

      {loading && (
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!loading && data?.length === 0 && (
        <div className="mt-8"><EmptyState title="Sin noticias publicadas" /></div>
      )}

      {!loading && data?.length > 0 && (
        <ul className="mt-8 grid gap-5 lg:grid-cols-3">
          {data.map((n) => (
            <li key={n.id}>
              <article className="flex h-full flex-col rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-700 dark:bg-ink-800">
                <p className="text-xs text-ink-500 dark:text-ink-400">
                  {formatFecha(n.fecha)} · {n.autor}
                </p>
                <h2 className="mt-2 font-display text-lg font-semibold text-ink-900 dark:text-ink-50">{n.titulo}</h2>
                <p className="mt-2 flex-1 text-sm text-ink-600 dark:text-ink-300">{n.resumen}</p>
                <Link
                  to={PATHS.noticiaDetalle(n.id)}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-300"
                >
                  Leer nota completa <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </article>
            </li>
          ))}
        </ul>
      )}
      </div>
    </div>
  );
}