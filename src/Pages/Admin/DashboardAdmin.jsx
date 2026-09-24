import { AlertTriangle, BarChart3, CalendarClock, DollarSign, Users } from 'lucide-react';
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { useFetch } from '@/Hooks/useFetch';
import { reportesService } from '@/Services/reportesService';
import StatCard from '@/Components/UI/StatCard';
import ErrorState from '@/Components/UI/ErrorState';
import { formatColones } from '@/Utils/format';

const COLORES = ['#B4531F', '#1F6F6B', '#E9A03B', '#8E857A'];

export default function DashboardAdmin() {
  const { data, loading, error, refetch } = useFetch(() => reportesService.dashboard(), []);

  if (error) return <ErrorState onRetry={refetch} />;

  const kpis = data?.kpis;

  return (
    <section>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-50">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          Resumen operativo del Centro Cultural Orotinense.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard loading={loading} label="Reservas totales" value={kpis?.reservasTotales ?? 0} Icon={CalendarClock} tone="brand" />
        <StatCard loading={loading} label="Reservas pendientes" value={kpis?.reservasPendientes ?? 0} Icon={AlertTriangle} tone="gold" delta="Requieren aprobación" />
        <StatCard loading={loading} label="Ingresos por boletos" value={formatColones(kpis?.ingresos ?? 0)} Icon={DollarSign} tone="jade" />
        <StatCard loading={loading} label="Usuarios registrados" value={kpis?.usuariosActivos ?? 0} Icon={Users} tone="ink" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <article className="rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-700 dark:bg-ink-800">
          <header className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink-900 dark:text-ink-50">Reservas por espacio</h2>
            <BarChart3 aria-hidden="true" className="h-4 w-4 text-ink-400" />
          </header>

          <div className="mt-4 h-72" role="img" aria-label="Gráfico de barras con el total de reservas por espacio">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.porEspacio ?? []} margin={{ top: 8, right: 8, left: -18, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D8D3CC" vertical={false} />
                <XAxis dataKey="nombre" angle={-30} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v} reservas`, 'Total']} />
                <Bar dataKey="reservas" fill="#B4531F" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-700 dark:bg-ink-800">
          <h2 className="font-display text-base font-semibold text-ink-900 dark:text-ink-50">Distribución por estado</h2>

          <div className="mt-4 h-72" role="img" aria-label="Gráfico circular con la distribución de reservas por estado">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.porEstado ?? []} dataKey="total" nameKey="estado" innerRadius={55} outerRadius={95} paddingAngle={4}>
                  {(data?.porEstado ?? []).map((entry, i) => (
                    <Cell key={entry.estado} fill={COLORES[i % COLORES.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip formatter={(v, n) => [`${v} reservas`, n]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 grid gap-2 text-sm text-ink-700 dark:text-ink-200" aria-label="Datos de distribución por estado">
            {(data?.porEstado ?? []).map((entry) => (
              <li key={entry.estado} className="flex items-center justify-between gap-4 border-t border-ink-100 pt-2 first:border-0 first:pt-0 dark:border-ink-700">
                <span>{entry.estado}</span>
                <strong>{entry.total} reservas</strong>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <article className="mt-6 rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-700 dark:bg-ink-800">
        <h2 className="font-display text-base font-semibold text-ink-900 dark:text-ink-50">Tendencia de reservas</h2>
        <div className="mt-4 h-64" role="img" aria-label="Gráfico de línea con la tendencia de reservas por estado">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.porEstado ?? []} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D8D3CC" vertical={false} />
              <XAxis dataKey="estado" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#1F6F6B" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>
    </section>
  );
}