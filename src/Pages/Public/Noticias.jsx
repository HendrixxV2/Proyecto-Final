import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useFetch } from '@/Hooks/useFetch';
import { noticiasService } from '@/Services/noticiasService';
import SectionTitle from '@/Components/common/SectionTitle';
import { SkeletonCard } from '@/Components/ui/Skeleton';
import EmptyState from '@/Components/ui/EmptyState';
import { formatFecha } from '@/Utils/format';
import { PATHS } from '@/Routes/paths';

export default function Noticias() {
  const { data, loading } = useFetch(() => noticiasService.list({ _sort: 'fecha', _order: 'desc' }), []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
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
  );
}