import { Download, FileSpreadsheet } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useFetch } from '@/Hooks/useFetch';
import { reportesService } from '@/Services/reportesService';
import Button from '@/Components/UI/Button';
import ErrorState from '@/Components/UI/ErrorState';
import StatCard from '@/Components/UI/StatCard';
import { CalendarClock, DollarSign, Users } from 'lucide-react';
import { formatColones } from '@/Utils/format';

export default function ReportesAdmin() {
  const { data, loading, error, refetch } = useFetch(() => reportesService.dashboard(), []);

  if (error) return <ErrorState onRetry={refetch} />;

  const exportarCSV = () => {
    const filas = [['Espacio', 'Reservas'], ...(data?.porEspacio ?? []).map((r) => [r.nombre, r.reservas])];
    const csv = filas.map((f) => f.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-espacios-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-50">Reportes</h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
            Indicadores de uso, ingresos y participación comunitaria.
          </p>
        </div>
        <Button variant="outline" onClick={exportarCSV}>
          <Download aria-hidden="true" className="h-4 w-4" />
          Exportar CSV
        </Button>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard loading={loading} label="Reservas" value={data?.kpis?.reservasTotales ?? 0} Icon={CalendarClock} tone="brand" />
        <StatCard loading={loading} label="Ingresos" value={formatColones(data?.kpis?.ingresos ?? 0)} Icon={DollarSign} tone="jade" />
        <StatCard loading={loading} label="Usuarios" value={data?.kpis?.usuariosActivos ?? 0} Icon={Users} tone="ink" />
      </div>

      <article className="mt-6 rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-700 dark:bg-ink-800">
        <header className="flex items-center gap-2">
          <FileSpreadsheet aria-hidden="true" className="h-4 w-4 text-ink-400" />
          <h2 className="font-display text-base font-semibold text-ink-900 dark:text-ink-50">Uso por espacio</h2>
        </header>

        <div className="mt-4 h-80" role="img" aria-label="Gráfico de barras horizontales con el uso de cada espacio">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.porEspacio ?? []} layout="vertical" margin={{ left: 24, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D8D3CC" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="nombre" width={140} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`${v} reservas`, 'Total']} />
              <Bar dataKey="reservas" fill="#1F6F6B" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>
    </section>
  );
}