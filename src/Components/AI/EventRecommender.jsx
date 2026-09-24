import { useEffect, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { aiService } from '@/Services/aiService';
import { formatFecha } from '@/Utils/format';
import { PATHS } from '@/Routes/paths';

export default function EventRecommender({ categoria, limite = 3 }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setLoading(true);
        const eventos = await aiService.recomendar({ limite });
        let filtered = eventos;

        if (categoria) {
          filtered = eventos.filter((evento) => (evento.categoria ?? '').toLowerCase() === String(categoria).toLowerCase());
        }

        if (isMounted) {
          setItems(filtered.slice(0, limite));
        }
      } catch {
        if (isMounted) setItems([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [categoria, limite]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: limite }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-2xl bg-ink-100 dark:bg-ink-700" />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-ink-300 bg-ink-50 p-5 text-sm text-ink-500 dark:border-ink-600 dark:bg-ink-800 dark:text-ink-400">
        No hay recomendaciones disponibles por el momento.
      </div>
    );
  }

  return (
    <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((evento) => (
        <li key={evento.id}>
          <article className="flex h-full flex-col rounded-2xl border border-ink-200 bg-white p-5 shadow-soft dark:border-ink-700 dark:bg-ink-800">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-jade-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-jade-700 dark:bg-jade-900/40 dark:text-jade-300">
                <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
                Recomendado
              </span>
              <span className="text-[11px] font-medium text-ink-500 dark:text-ink-400">{evento.categoria}</span>
            </div>

            <h3 className="mt-4 font-display text-lg font-semibold text-ink-900 dark:text-ink-50">{evento.titulo}</h3>
            <p className="mt-2 flex-1 text-sm text-ink-600 dark:text-ink-300">{evento.descripcion}</p>

            <p className="mt-4 text-xs font-medium text-ink-500 dark:text-ink-400">
              {formatFecha(evento.fecha, "d 'de' MMMM")} · {evento.horaInicio}
            </p>

            <Link
              to={PATHS.calendario}
              className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-300"
            >
              Ver programa <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </article>
        </li>
      ))}
    </ul>
  );
}
