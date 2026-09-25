import { useEffect, useState } from 'react';
import { useFetch } from '@/Hooks/useFetch';
import { contenidoService } from '@/Services/contenidoService';
import SectionTitle from '@/Components/Common/SectionTitle';
import Modal from '@/Components/UI/Modal';
import { ArrowLeft, ArrowRight, Images } from 'lucide-react';

const FOTOS_ARCHIVO = [
  {
    src: '/estacion%20de%20Orotina.jpeg',
    titulo: 'Orotina, estación y memoria',
    descripcion: 'Una mirada al paisaje ferroviario que marcó el pulso del cantón.',
  },
  {
    src: '/Ferrocarril.jpeg',
    titulo: 'El tren al Pacífico',
    descripcion: 'La huella de una ruta que acercó comunidades y cambió la región.',
  },
  {
    src: '/ferropacifico.jpeg',
    titulo: 'Rieles hacia el Pacífico',
    descripcion: 'Fragmentos de una historia que todavía acompaña a Orotina.',
  },
  {
    src: '/orotina.jpeg',
    titulo: 'Orotina en perspectiva',
    descripcion: 'El territorio y la memoria que crecieron alrededor del ferrocarril.',
  },
];

export default function Galeria() {
  const { data } = useFetch(() => contenidoService.bySeccion('galeria_ferrocarril'), []);
  const [indiceActivo, setIndiceActivo] = useState(null);
  const pieza = data?.[0];

  useEffect(() => {
    if (indiceActivo === null) return undefined;

    const manejarTeclado = (evento) => {
      if (evento.key === 'ArrowRight') {
        setIndiceActivo((indice) => (indice + 1) % FOTOS_ARCHIVO.length);
      }
      if (evento.key === 'ArrowLeft') {
        setIndiceActivo((indice) => (indice - 1 + FOTOS_ARCHIVO.length) % FOTOS_ARCHIVO.length);
      }
    };

    document.addEventListener('keydown', manejarTeclado);
    return () => document.removeEventListener('keydown', manejarTeclado);
  }, [indiceActivo]);

  const fotoActiva = indiceActivo === null ? null : FOTOS_ARCHIVO[indiceActivo];
  const avanzar = () => setIndiceActivo((indice) => (indice + 1) % FOTOS_ARCHIVO.length);
  const retroceder = () => setIndiceActivo((indice) => (indice - 1 + FOTOS_ARCHIVO.length) % FOTOS_ARCHIVO.length);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionTitle
        eyebrow="Archivo fotográfico"
        title="Galería Ferrocarril"
        description="Imágenes, planos y objetos que documentan la vida del Ferrocarril al Pacífico en Orotina."
      />

      <button
        type="button"
        onClick={() => setIndiceActivo(0)}
        className="group mt-10 grid w-full overflow-hidden rounded-2xl border border-amber-900/20 bg-[#201d19] text-left shadow-xl shadow-stone-950/10 transition duration-300 hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-offset-4 md:min-h-[25rem] md:grid-cols-[1.15fr_0.85fr]"
        aria-label="Abrir presentación de fotografías del Ferrocarril al Pacífico"
      >
        <span className="relative block min-h-64 overflow-hidden bg-stone-800 md:min-h-full">
          <img
            src="/rielDeOrotina.jpeg"
            alt="Rieles del ferrocarril en Orotina"
            className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-[#171512]/85 via-transparent to-[#171512]/15" />
          <span className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-[#171512]/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-stone-100 backdrop-blur-sm">
            <Images aria-hidden="true" className="h-4 w-4 text-amber-300" />
            Archivo fotográfico
          </span>
          <span className="absolute bottom-5 left-5 font-mono text-xs uppercase tracking-[0.16em] text-stone-200/90">
            Orotina · Ferrocarril al Pacífico
          </span>
        </span>

        <span className="flex flex-col justify-between gap-10 p-6 text-stone-100 sm:p-9 lg:p-11">
          <span>
            <span className="mb-5 block h-px w-14 bg-amber-400" />
            <span className="block font-mono text-xs uppercase tracking-[0.2em] text-amber-300">Colección · 01 / 04</span>
            <span className="mt-4 block font-display text-3xl font-semibold leading-tight sm:text-4xl">
              {pieza?.titulo || 'Estación de Orotina'}
            </span>
            <span className="mt-4 block max-w-lg text-sm leading-7 text-stone-300 sm:text-base">
              {pieza?.cuerpo || 'Imágenes que recorren la memoria ferroviaria y el paisaje de Orotina.'}
            </span>
          </span>

          <span className="flex items-center justify-between gap-4 border-t border-white/15 pt-5">
            <span className="text-sm font-medium text-stone-200">Ver las fotografías</span>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-amber-300/70 text-amber-200 transition group-hover:bg-amber-300 group-hover:text-stone-950">
              <ArrowRight aria-hidden="true" className="h-5 w-5" />
            </span>
          </span>
        </span>
      </button>

      <Modal
        open={indiceActivo !== null}
        onClose={() => setIndiceActivo(null)}
        title={fotoActiva?.titulo || 'Archivo fotográfico'}
        description={fotoActiva?.descripcion}
        size="lg"
      >
        {fotoActiva && (
          <>
            <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden rounded-xl bg-[#171512]">
              <img src={fotoActiva.src} alt={fotoActiva.titulo} className="h-full w-full object-contain" />
              <button
                type="button"
                onClick={retroceder}
                aria-label="Ver fotografía anterior"
                className="absolute left-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/55 text-white transition hover:bg-black/80"
              >
                <ArrowLeft aria-hidden="true" className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={avanzar}
                aria-label="Ver fotografía siguiente"
                className="absolute right-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/55 text-white transition hover:bg-black/80"
              >
                <ArrowRight aria-hidden="true" className="h-5 w-5" />
              </button>
              <span className="absolute bottom-3 right-3 rounded-full bg-black/65 px-3 py-1 font-mono text-xs text-white">
                {String(indiceActivo + 1).padStart(2, '0')} / {String(FOTOS_ARCHIVO.length).padStart(2, '0')}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between gap-4">
              <p className="text-sm leading-relaxed text-ink-700 dark:text-ink-200">{fotoActiva.descripcion}</p>
              <div className="flex shrink-0 items-center gap-1.5" aria-label="Elegir fotografía">
                {FOTOS_ARCHIVO.map((foto, indice) => (
                  <button
                    key={foto.src}
                    type="button"
                    onClick={() => setIndiceActivo(indice)}
                    aria-label={`Ver fotografía ${indice + 1}: ${foto.titulo}`}
                    aria-current={indiceActivo === indice ? 'true' : undefined}
                    className={`h-2.5 w-2.5 rounded-full transition ${indiceActivo === indice ? 'bg-amber-600 ring-2 ring-amber-600/25' : 'bg-ink-300 hover:bg-amber-400 dark:bg-ink-500'}`}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}