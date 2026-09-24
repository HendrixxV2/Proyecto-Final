import { useState } from 'react';
import { useFetch } from '@/Hooks/useFetch';
import { contenidoService } from '@/Services/contenidoService';
import SectionTitle from '@/Components/Common/SectionTitle';
import Modal from '@/Components/UI/Modal';
import { Skeleton } from '@/Components/UI/Skeleton';
import EmptyState from '@/Components/UI/EmptyState';

export default function Galeria() {
  const { data, loading } = useFetch(() => contenidoService.bySeccion('galeria_ferrocarril'), []);
  const [seleccionado, setSeleccionado] = useState(null);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionTitle
        eyebrow="Archivo fotográfico"
        title="Galería Ferrocarril"
        description="Imágenes, planos y objetos que documentan la vida del Ferrocarril al Pacífico en Orotina."
      />

      {loading && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56 w-full rounded-2xl" />)}
        </div>
      )}

      {!loading && data?.length === 0 && (
        <div className="mt-8">
          <EmptyState title="Galería en curaduría" description="Pronto publicaremos nuevas piezas del archivo." />
        </div>
      )}

      {!loading && data?.length > 0 && (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((pieza) => (
            <li key={pieza.id}>
              <button
                type="button"
                onClick={() => setSeleccionado(pieza)}
                className="group w-full overflow-hidden rounded-2xl border border-ink-200 text-left transition hover:shadow-soft dark:border-ink-700"
              >
                <span className="flex h-56 items-center justify-center bg-gradient-to-br from-ink-200 to-ink-300 dark:from-ink-700 dark:to-ink-800">
                  <span className="font-display text-sm font-semibold text-ink-500 dark:text-ink-300">Archivo CACO</span>
                </span>
                <span className="block p-4">
                  <span className="block font-display text-base font-semibold text-ink-900 dark:text-ink-50">{pieza.titulo}</span>
                  <span className="mt-1 block text-sm text-ink-500 dark:text-ink-400">{pieza.cuerpo}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Modal open={Boolean(seleccionado)} onClose={() => setSeleccionado(null)} title={seleccionado?.titulo} size="lg">
        <div className="flex h-72 items-center justify-center rounded-xl bg-ink-100 dark:bg-ink-700">
          <span className="font-display text-sm text-ink-500 dark:text-ink-300">Imagen del archivo histórico</span>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-ink-700 dark:text-ink-200">{seleccionado?.cuerpo}</p>
      </Modal>
    </div>
  );
}