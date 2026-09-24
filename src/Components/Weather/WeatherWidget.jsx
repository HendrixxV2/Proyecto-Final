import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Droplets,
  RefreshCw,
  Sun,
  Wind,
} from 'lucide-react';
import { useFetch } from '@/Hooks/useFetch';
import { useLanguage } from '@/Hooks/useLanguage';
import { weatherService } from '@/Services/weatherService';
import { cn } from '@/Utils/cn';
import Button from '@/Components/UI/Button';

const WEATHER_ICONS = {
  sun: Sun,
  'cloud-sun': CloudSun,
  cloud: Cloud,
  fog: CloudFog,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  storm: CloudLightning,
};

const WEATHER_DAYS = 7;

function WeatherScene({ animation, Icon }) {
  return (
    <div className={cn('weather-scene', `weather-scene--${animation}`)} aria-hidden="true">
      <span className="weather-glow" />
      <span className="weather-cloud weather-cloud--back"><Cloud /></span>
      <span className="weather-sun"><Sun /></span>
      <span className="weather-cloud weather-cloud--front"><Cloud /></span>
      <span className="weather-fog-lines"><i /><i /><i /></span>
      <span className="weather-rain-drops"><i /><i /><i /><i /><i /></span>
      <span className="weather-flash"><CloudLightning /></span>
      <Icon className="weather-scene__fallback" />
    </div>
  );
}

function formatDay(date, language) {
  const locale = language === 'zh' ? 'zh-Hant' : language === 'en' ? 'en-US' : 'es-CR';
  return new Date(`${date}T12:00:00`).toLocaleDateString(locale, { weekday: 'short' }).replace('.', '');
}

export default function WeatherWidget({ className }) {
  const { language, t } = useLanguage();
  const { data, loading, error, refetch } = useFetch(
    (signal) => weatherService.forecast({ days: WEATHER_DAYS, signal }),
    [],
  );

  if (loading) {
    return <div className={cn('h-64 animate-pulse rounded-2xl bg-ink-200/60 dark:bg-ink-700/60', className)} aria-hidden="true" />;
  }

  if (error || !data?.actual || !data.diario?.length) {
    return (
      <section className={cn('rounded-2xl border border-dashed border-ink-300 bg-ink-50 p-5 dark:border-ink-600 dark:bg-ink-800', className)} aria-label={t('weather.title')}>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">{t('weather.title')}</p>
        <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">{t('weather.unavailable')}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
          <RefreshCw aria-hidden="true" className="h-4 w-4" />
          {t('weather.retry')}
        </Button>
      </section>
    );
  }

  const { actual, diario } = data;
  const evaluacion = weatherService.evaluarAireLibre(diario[0]);
  const animation = actual.animacion ?? 'cloud';
  const WeatherIcon = WEATHER_ICONS[actual.icono] ?? Cloud;

  return (
    <section className={cn('weather-card group/weather overflow-hidden rounded-2xl border border-ink-200 bg-white p-5 shadow-soft dark:border-ink-700 dark:bg-ink-800', className)} aria-label={t('weather.title')}>
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">{t('weather.title')}</p>
          <p className="mt-1 font-display text-3xl font-bold text-ink-900 dark:text-ink-50">{actual.temperatura}°C</p>
          <p className="text-sm text-ink-600 dark:text-ink-300">{actual.texto}</p>
        </div>
        <WeatherScene animation={animation} Icon={WeatherIcon} />
      </header>

      <dl className="mt-3 grid grid-cols-2 gap-3 text-xs text-ink-600 dark:text-ink-300">
        <div className="flex items-center gap-2">
          <Droplets aria-hidden="true" className="h-4 w-4 text-jade-500" />
          <dt className="sr-only">{t('weather.humidity')}</dt>
          <dd>{actual.humedad}% {t('weather.humidity')}</dd>
        </div>
        <div className="flex items-center gap-2">
          <Wind aria-hidden="true" className="h-4 w-4 text-jade-500" />
          <dt className="sr-only">{t('weather.wind')}</dt>
          <dd>{actual.viento} km/h {t('weather.wind')}</dd>
        </div>
      </dl>

      <div className="mt-5 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink-800 dark:text-ink-100">{t('weather.forecast')}</h3>
        <span className="text-[11px] text-ink-500 dark:text-ink-400">{t('weather.days').replace('{count}', WEATHER_DAYS)}</span>
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7" aria-label={t('weather.forecast')}>
        {diario.map((day, index) => {
          const DayIcon = WEATHER_ICONS[day.icono] ?? Cloud;
          return (
            <li key={day.fecha} className={cn('rounded-xl bg-ink-100 p-2 text-center transition duration-300 hover:-translate-y-1 hover:bg-cielo-50 dark:bg-ink-700 dark:hover:bg-ink-600', index === 0 && 'ring-1 ring-brand-300')}>
              <p className="text-[10px] font-medium capitalize text-ink-500 dark:text-ink-400">{index === 0 ? t('weather.today') : formatDay(day.fecha, language)}</p>
              <DayIcon aria-hidden="true" className="mx-auto my-1 h-4 w-4 text-cielo-600 dark:text-cielo-300" />
              <p className="text-xs font-bold text-ink-800 dark:text-ink-100">{day.max}° <span className="font-normal text-ink-500">{day.min}°</span></p>
              <p className="mt-1 text-[10px] text-ink-500 dark:text-ink-400">{day.lluvia}%</p>
            </li>
          );
        })}
      </ul>

      <p className={cn('mt-4 flex items-start gap-2 rounded-xl p-3 text-xs', evaluacion.apto ? 'bg-jade-50 text-jade-800 dark:bg-jade-900/40 dark:text-jade-100' : 'bg-amber-50 text-amber-900 dark:bg-amber-950/50 dark:text-amber-100')}>
        <CloudRain aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
        <span><strong className="font-semibold">{t('weather.outdoor')}: </strong>{evaluacion.mensaje}</span>
      </p>
      <p className="mt-3 text-right text-[10px] text-ink-400">{t('weather.source')}</p>
    </section>
  );
}
