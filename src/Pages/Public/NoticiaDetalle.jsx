import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useFetch } from '@/Hooks/useFetch';
import { noticiasService } from '@/Services/noticiasService';
import NewsSummary from '@/Components/AI/NewsSummary';
import Spinner from '@/Components/UI/Spinner';
import ErrorState from '@/Components/UI/ErrorState';
import { formatFecha, hace } from '@/Utils/format';
import { PATHS } from '@/Routes/paths';
import { useLanguage } from '@/Hooks/useLanguage';

export default function NoticiaDetalle() {
  const { t } = useLanguage();
  const { id } = useParams();
  const { data: noticia, loading, error, refetch } = useFetch(() => noticiasService.getById(id), [id]);

  if (loading) return <div className="grid min-h-[60vh] place-items-center"><Spinner label={t('newsDetail.loading')} /></div>;
  if (error) return <div className="mx-auto max-w-3xl px-4 py-12"><ErrorState onRetry={refetch} /></div>;
  if (!noticia) return null;

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link to={PATHS.noticias} className="inline-flex items-center gap-2 text-sm text-ink-500 hover:text-brand-600 dark:text-ink-400">
        <ArrowLeft aria-hidden="true" className="h-4 w-4" /> {t('newsDetail.back')}
      </Link>

      <header className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">{noticia.categoria}</p>
        <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-ink-900 dark:text-ink-50">{noticia.titulo}</h1>
        <p className="mt-3 text-sm text-ink-500 dark:text-ink-400">
          {noticia.autor} · {formatFecha(noticia.fecha)} · {hace(noticia.fecha)}
        </p>
      </header>

      {noticia.imagen && (
        <figure className="mt-6 overflow-hidden rounded-xl">
          <img src={noticia.imagen} alt={noticia.titulo} className="max-h-[32rem] w-full object-cover" />
        </figure>
      )}

      <div className="mt-6">
        <NewsSummary noticia={noticia} />
      </div>

      <div className="mt-8 space-y-4 text-base leading-relaxed text-ink-700 dark:text-ink-200">
        {noticia.contenido.split('\n').map((parrafo, i) => (
          <p key={i}>{parrafo}</p>
        ))}
      </div>

      {noticia.galeria && (
        <section aria-label={t('newsDetail.schoolMemory')} className="mt-10">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-xl font-bold text-ink-900 dark:text-ink-50">{t('newsDetail.generations')}</h2>
            <dl className="flex gap-4 rounded-lg border border-ink-200 bg-white/80 px-4 py-3 text-sm dark:border-ink-700 dark:bg-ink-800/80">
              <div>
                <dt className="text-xs text-ink-500 dark:text-ink-400">{t('newsDetail.birth')}</dt>
                <dd className="font-semibold text-ink-900 dark:text-ink-50">{noticia.biografia.nacimiento}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-500 dark:text-ink-400">{t('newsDetail.death')}</dt>
                <dd className="font-semibold text-ink-900 dark:text-ink-50">{noticia.biografia.defuncion}</dd>
              </div>
            </dl>
          </div>
          <p className="mb-5 text-xs text-ink-500 dark:text-ink-400">{noticia.biografia.nota}</p>
          <div className="grid gap-5 sm:grid-cols-2">
            {noticia.galeria.map((imagen) => (
              <figure key={imagen.src} className="overflow-hidden rounded-xl border border-ink-200 bg-white dark:border-ink-700 dark:bg-ink-800">
                <img src={imagen.src} alt={imagen.alt} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                <figcaption className="p-3 text-sm text-ink-600 dark:text-ink-300">{imagen.pie}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}