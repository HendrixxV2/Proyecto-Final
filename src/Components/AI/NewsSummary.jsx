import { Sparkles } from 'lucide-react';
import { resumirTexto } from '@/Services/aiService';

export default function NewsSummary({ noticia, oraciones = 2 }) {
  if (!noticia) return null;

  const resumen = resumirTexto(noticia.contenido || noticia.resumen || '', oraciones);

  return (
    <aside className="rounded-2xl border border-jade-200 bg-jade-50 p-5 dark:border-jade-800 dark:bg-jade-900/30">
      <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-jade-700 dark:text-jade-300">
        <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
        Resumen generado por IA
      </p>
      <p className="mt-2 text-sm leading-relaxed text-jade-900 dark:text-jade-100">{resumen}</p>
    </aside>
  );
}