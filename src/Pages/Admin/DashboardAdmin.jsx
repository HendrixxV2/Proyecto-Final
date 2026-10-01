import { Activity, AlertTriangle, BarChart3, CalendarClock, CheckCircle2, DollarSign, Users } from 'lucide-react';
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { useMemo, useState } from 'react';
import { useFetch } from '@/Hooks/useFetch';
import { reportesService } from '@/Services/reportesService';
import StatCard from '@/Components/UI/StatCard';
import ErrorState from '@/Components/UI/ErrorState';
import { formatColones } from '@/Utils/format';
import { PATHS } from '@/Routes/paths';
import { useLanguage } from '@/Hooks/useLanguage';

const COLORES = ['#5b77ef', '#32b9c8', '#e8ad48', '#8793ad'];

const DEFAULT_DETAIL = {
  title: 'Panel operativo',
  description: 'Selecciona una tarjeta para ver el detalle de la operación y abrir la vista asociada.',
  meta: 'Información consolidada de reservas, usuarios y reportes.',
};

export default function DashboardAdmin() {
  const { t } = useLanguage();
  const { data, loading, error, refetch } = useFetch(() => reportesService.dashboard(), []);
  const [selectedMetric, setSelectedMetric] = useState('overview');

  const kpis = data?.kpis;
  const totalReservas = kpis?.reservasTotales ?? 0;
  const aprobadas = data?.porEstado?.find((item) => item.estado === 'aprobada')?.total ?? 0;
  const pendientes = kpis?.reservasPendientes ?? 0;
  const porcentajeAprobadas = totalReservas ? Math.round((aprobadas / totalReservas) * 100) : 0;

  const metricDetails = useMemo(() => ({
    overview: {
      title: t('dashboard.overview'),
      description: t('dashboard.panelDescription'),
      meta: t('dashboard.approvalRate', { percent: porcentajeAprobadas }),
      route: PATHS.admin.dashboard,
    },
    reservas: {
      title: t('dashboard.bookingsTitle'),
      description: t('dashboard.bookingsDescription'),
      meta: t('dashboard.pendingMeta', { count: pendientes }),
      route: PATHS.admin.reservas,
    },
    ingresos: {
      title: t('dashboard.incomeTitle'),
      description: t('dashboard.incomeDescription'),
      meta: t('dashboard.totalMeta', { amount: formatColones(kpis?.ingresos ?? 0) }),
      route: PATHS.admin.reportes,
    },
    usuarios: {
      title: t('dashboard.usersTitle'),
      description: t('dashboard.usersDescription'),
      meta: t('dashboard.registeredMeta', { count: kpis?.usuariosActivos ?? 0 }),
      route: PATHS.admin.usuarios,
    },
  }), [kpis, pendientes, porcentajeAprobadas, t]);

  const selectedDetail = metricDetails[selectedMetric] ?? DEFAULT_DETAIL;

  const handleMetricClick = (metricId) => {
    setSelectedMetric(metricId);
  };

  if (error) {
    return <ErrorState onRetry={refetch} />;
  }

  return (
    <section className="admin-dashboard space-y-5">
      <header className="admin-dashboard__heading">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">{t('dashboard.organization')}</p>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-50">{t('dashboard.title')}</h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">{t('dashboard.subtitle')}</p>
        </div>
        <span className="admin-dashboard__status">{t('dashboard.overview')}</span>
      </header>

      <article className="admin-hero">
        <div className="admin-hero__content">
          <p className="admin-hero__eyebrow">{t('dashboard.activity')}</p>
          <h2 className="admin-hero__title">{t('dashboard.heroTitle')}</h2>
          <p className="admin-hero__copy">{t('dashboard.heroCopy')}</p>
          <div className="admin-hero__metrics">
            <div className="admin-hero__metric">
              <strong>{totalReservas}</strong>
              <span>{t('dashboard.bookings')}</span>
            </div>
            <div className="admin-hero__metric">
              <strong>{pendientes}</strong>
              <span>{t('dashboard.pending')}</span>
            </div>
            <div className="admin-hero__metric">
              <strong>{porcentajeAprobadas}%</strong>
              <span>{t('dashboard.approved')}</span>
            </div>
          </div>
        </div>
        <div className="admin-hero__dial" aria-label={`${porcentajeAprobadas}% de reservas aprobadas`} role="img">
          <span>{porcentajeAprobadas}%</span>
        </div>
      </article>

      <article className="admin-chart-panel border border-brand-200 bg-brand-50/60 dark:border-brand-800/60 dark:bg-brand-900/20">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700 dark:text-brand-200">{t('dashboard.activeDetail')}</p>
            <h2 className="mt-2 text-xl font-bold text-ink-900 dark:text-ink-50">{selectedDetail.title}</h2>
          </div>
          <a
            href={selectedDetail.route}
            className="rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-100 dark:border-brand-700 dark:bg-brand-950 dark:text-brand-200"
          >
            {t('dashboard.showSection')}
          </a>
        </div>
        <p className="mt-3 text-sm text-ink-600 dark:text-ink-300">{selectedDetail.description}</p>
        <p className="mt-2 text-xs font-medium uppercase tracking-wide text-ink-500 dark:text-ink-400">{selectedDetail.meta}</p>
      </article>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard loading={loading} label={t('dashboard.totalBookings')} value={kpis?.reservasTotales ?? 0} Icon={CalendarClock} tone="brand" onClick={() => handleMetricClick('reservas')} />
        <StatCard loading={loading} label={t('dashboard.pendingBookings')} value={kpis?.reservasPendientes ?? 0} Icon={AlertTriangle} tone="gold" delta={t('dashboard.requiresApproval')} onClick={() => handleMetricClick('reservas')} />
        <StatCard loading={loading} label={t('dashboard.ticketIncome')} value={formatColones(kpis?.ingresos ?? 0)} Icon={DollarSign} tone="jade" onClick={() => handleMetricClick('ingresos')} />
        <StatCard loading={loading} label={t('dashboard.registeredUsers')} value={kpis?.usuariosActivos ?? 0} Icon={Users} tone="ink" onClick={() => handleMetricClick('usuarios')} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <article className="admin-chart-panel">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="admin-chart-panel__title">{t('dashboard.bySpace')}</h2>
              <p className="admin-chart-panel__subtitle">{t('dashboard.bySpaceDescription')}</p>
            </div>
            <BarChart3 aria-hidden="true" className="h-4 w-4 text-ink-400" />
          </header>

          <div className="mt-4 h-72" role="img" aria-label={t('dashboard.barChart')}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.porEspacio ?? []} margin={{ top: 8, right: 8, left: 8, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" vertical={false} />
                <XAxis dataKey="nombre" angle={-30} textAnchor="end" interval={0} tick={{ fontSize: 11, fill: 'var(--admin-muted)' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--admin-muted)' }} />
                <Tooltip position={{ x: 8, y: 8 }} formatter={(v) => [t('dashboard.reservations', { count: v }), t('dashboard.totalBookings')]} contentStyle={{ backgroundColor: 'var(--admin-surface)', borderColor: 'var(--admin-border)', borderRadius: 8 }} />
                <Bar dataKey="reservas" fill="#5b77ef" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="admin-chart-panel">
          <h2 className="admin-chart-panel__title">{t('dashboard.statusTitle')}</h2>
          <p className="admin-chart-panel__subtitle">{t('dashboard.statusDescription')}</p>

          <div className="mt-4 h-72" role="img" aria-label={t('dashboard.pieChart')}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.porEstado ?? []} dataKey="total" nameKey="estado" innerRadius={55} outerRadius={95} paddingAngle={4}>
                  {(data?.porEstado ?? []).map((entry, i) => (
                    <Cell key={entry.estado} fill={COLORES[i % COLORES.length]} />
                  ))}
                </Pie>
                <Legend formatter={(value) => <span style={{ color: 'var(--admin-muted)' }}>{value}</span>} />
                <Tooltip position={{ x: 8, y: 8 }} formatter={(v, n) => [t('dashboard.reservations', { count: v }), n]} contentStyle={{ backgroundColor: 'var(--admin-surface)', borderColor: 'var(--admin-border)', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 grid gap-2 text-sm text-ink-700 dark:text-ink-200" aria-label={t('dashboard.distribution')}>
            {(data?.porEstado ?? []).map((entry) => (
              <li key={entry.estado} className="flex items-center justify-between gap-4 border-t border-ink-100 pt-2 first:border-0 first:pt-0 dark:border-ink-700">
                <span>{entry.estado}</span>
                <strong>{t('dashboard.reservations', { count: entry.total })}</strong>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <article className="admin-chart-panel">
        <header className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-200">
            <Activity aria-hidden="true" className="h-4 w-4" />
          </span>
          <div>
            <h2 className="admin-chart-panel__title">{t('dashboard.requestsSummary')}</h2>
            <p className="admin-chart-panel__subtitle">{t('dashboard.currentStatus')}</p>
          </div>
        </header>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {(data?.porEstado ?? []).map((item) => (
            <div key={item.estado} className="flex items-center gap-3 rounded-lg bg-ink-50 p-3 dark:bg-ink-900">
              <CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0 text-brand-500" />
              <div className="min-w-0">
                <p className="truncate text-xs capitalize text-ink-500 dark:text-ink-400">{item.estado}</p>
                <p className="mt-0.5 font-semibold tabular-nums text-ink-900 dark:text-ink-50">{t('dashboard.requests', { count: item.total })}</p>
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}