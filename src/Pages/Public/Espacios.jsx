import { Link } from 'react-router-dom';
import { ArrowRight, MapPinned } from 'lucide-react';
import { useFetch } from '@/Hooks/useFetch';
import { espaciosService } from '@/Services/espaciosService';
import SectionTitle from '@/Components/Common/SectionTitle';
import Badge from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import EmptyState from '@/Components/UI/EmptyState';
import { SkeletonCard } from '@/Components/UI/Skeleton';
import { PATHS } from '@/Routes/paths';
import { formatColones } from '@/Utils/format';

export default function Espacios() {
  const { data: espacios, loading } = useFetch(() => espaciosService.list({ activo: true }), []);

  return (
    <main className="relative isolate overflow-hidden bg-ink-50 dark:bg-ink-900">
      <div aria-hidden="true" className="absolute inset-0 bg-cover bg-center opacity-[0.36]" style={{ backgroundImage: "url('/espacios1.jpeg')" }} />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-white/85 via-white/80 to-jade-50/70 dark:from-ink-900/95 dark:via-ink-900/90 dark:to-jade-950/85" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Espacios"
          title="Salas, talleres y galerías"
          description="Explora los espacios disponibles para eventos culturales, talleres, reuniones y exposiciones."
        />

      {loading ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : !espacios?.length ? (
        <div className="mt-8">
          <EmptyState title="No hay espacios disponibles" description="Pronto agregaremos nuevas salas y galerías." />
        </div>
      ) : (
        <ul className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {espacios.map((espacio) => (
            <li key={espacio.id}>
              <article className="tarjeta-cultural flex h-full flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-jade-300">
                      {espacio.tipo ?? 'Espacio'}
                    </p>
                    <h2 className="mt-2 font-display text-xl font-semibold text-white">
                      {espacio.nombre}
                    </h2>
                  </div>
                  <MapPinned aria-hidden="true" className="h-5 w-5 text-cian-200" />
                </div>

                <p className="mt-4 line-clamp-3 text-sm text-white/75">
                  {espacio.descripcion}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge tone="jade">Capacidad: {espacio.capacidad ?? 0}</Badge>
                  <Badge tone="brand">{formatColones(espacio.precioHora ?? 0)} / hora</Badge>
                </div>

                <div className="mt-5 flex items-center justify-between text-sm text-white/75">
                  <span>{espacio.ubicacion ?? 'Ubicación por confirmar'}</span>
                </div>

                <div className="mt-6">
                  <Button as={Link} to={PATHS.espacioDetalle(espacio.id)} variant="outline" className="w-full justify-center">
                    Ver detalle
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </Button>
                </div>
              </article>
            </li>
          ))}
        </ul>
        )}
      </div>
    </main>
  );
}
