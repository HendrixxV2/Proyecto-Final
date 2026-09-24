import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useFetch } from '@/Hooks/useFetch';
import { noticiasService } from '@/Services/noticiasService';
import NewsSummary from '@/Components/AI/NewsSummary';
import Spinner from '@/Components/UI/Spinner';
import ErrorState from '@/Components/UI/ErrorState';
import { formatFecha, hace } from '@/Utils/format';
import { PATHS } from '@/Routes/paths';

export default function NoticiaDetalle() {
  const { id } = useParams();
  const { data: noticia, loading, error, refetch } = useFetch(() => noticiasService.getById(id), [id]);

  if (loading) return <div className="grid min-h-[60vh] place-items-center"><Spinner label="Cargando noticia…" /></div>;
  if (error) return <div className="mx-auto max-w-3xl px-4 py-12"><ErrorState onRetry={refetch} /></div>;
  if (!noticia) return null;

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link to={PATHS.noticias} className="inline-flex items-center gap-2 text-sm text-ink-500 hover:text-brand-600 dark:text-ink-400">
        <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Volver a noticias
      </Link>

      <header className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">{noticia.categoria}</p>
        <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-ink-900 dark:text-ink-50">{noticia.titulo}</h1>
        <p className="mt-3 text-sm text-ink-500 dark:text-ink-400">
          {noticia.autor} · {formatFecha(noticia.fecha)} · {hace(noticia.fecha)}
        </p>
      </header>

      <div className="mt-6">
        <NewsSummary noticia={noticia} />
      </div>

      <div className="mt-8 space-y-4 text-base leading-relaxed text-ink-700 dark:text-ink-200">
        {noticia.contenido.split('\n').map((parrafo, i) => (
          <p key={i}>{parrafo}</p>
        ))}
      </div>
    </article>
  );
}