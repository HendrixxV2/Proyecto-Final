import { CloudRain, Droplets, Sun, Wind } from 'lucide-react';
import { useFetch } from '@/Hooks/useFetch';
import { weatherService } from '@/Services/weatherService';
import { cn } from '@/Utils/cn';

export default function WeatherWidget({ className }) {
  const { data, loading, error } = useFetch(() => weatherService.forecast({ days: 5 }), []);

  if (loading) {
    return <div className={cn('h-32 animate-pulse rounded-2xl bg-ink-200/60 dark:bg-ink-700/60', className)} aria-hidden="true" />;
  }

  if (error || !data) {
    return (
      <div className={cn('rounded-2xl border border-dashed border-ink-300 p-5 text-sm text-ink-500 dark:border-ink-600', className)}>
        Clima no disponible en este momento.
      </div>
    );
  }

  const { actual, diario } = data;
  const evaluacion = weatherService.evaluarAireLibre(diario[0]);

  return (
    <section className={cn('rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-700 dark:bg-ink-800', className)} aria-label="Clima en Orotina">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">Clima en Orotina</p>
          <p className="mt-1 font-display text-3xl font-bold text-ink-900 dark:text-ink-50">{actual.temperatura}°C</p>
          <p className="text-sm text-ink-600 dark:text-ink-300">{actual.texto}</p>
        </div>
        <Sun aria-hidden="true" className="h-10 w-10 text-gold-500" />
      </header>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs text-ink-600 dark:text-ink-300">
        <div className="flex items-center gap-2">
          <Droplets aria-hidden="true" className="h-4 w-4 text-jade-500" />
          <dt className="sr-only">Humedad</dt>
          <dd>{actual.humedad}% humedad</dd>
        </div>
        <div className="flex items-center gap-2">
          <Wind aria-hidden="true" className="h-4 w-4 text-jade-500" />
          <dt className="sr-only">Viento</dt>
          <dd>{actual.viento} km/h</dd>
        </div>
      </dl>

      <ul className="mt-4 grid grid-cols-5 gap-1.5" aria-label="Pronóstico de 5 días">
        {diario.map((d) => (
          <li key={d.fecha} className="rounded-xl bg-ink-100 p-2 text-center dark:bg-ink-700">
            <p className="text-[10px] font-medium text-ink-500 dark:text-ink-400">
              {new Date(`${d.fecha}T12:00:00`).toLocaleDateString('es-CR', { weekday: 'short' })}
            </p>
            <p className="mt-1 text-xs font-bold text-ink-800 dark:text-ink-100">{d.max}°</p>
            <p className="text-[10px] text-ink-500 dark:text-ink-400">{d.min}°</p>
          </li>
        ))}
      </ul>

      <p
        className={cn(
          'mt-4 flex items-start gap-2 rounded-xl p-3 text-xs',
          evaluacion.apto
            ? 'bg-jade-50 text-jade-800 dark:bg-jade-900/40 dark:text-jade-100'
            : 'bg-amber-50 text-amber-900 dark:bg-amber-950/50 dark:text-amber-100',
        )}
      >
        <CloudRain aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          <strong className="font-semibold">Eventos al aire libre: </strong>
          {evaluacion.mensaje}
        </span>
      </p>
    </section>
  );
}