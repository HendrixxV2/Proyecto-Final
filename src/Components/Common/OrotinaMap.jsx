import { useEffect, useState } from 'react';
import { MapPinned } from 'lucide-react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import { useLanguage } from '@/Hooks/useLanguage';
import 'leaflet/dist/leaflet.css';

const OROTINA_CENTER = [9.9112, -84.5239];

const PUNTOS = [
  {
    id: 'parque-jose-marti',
    nombre: 'Parque José Martí',
    nombreEn: 'José Martí Park',
    nombreZh: '何塞·馬蒂公園',
    categoria: 'Espacio público',
    categoriaEn: 'Public space',
    categoriaZh: '公共空間',
    posicion: [9.9117503, -84.5235447],
    descripcion: 'Parque identificado en la cartografía abierta de Orotina.',
    descripcionEn: 'Park identified in the open cartography of Orotina.',
    descripcionZh: '在奧羅蒂納開放地圖中識別出的公園。',
    fuente: 'OpenStreetMap',
  },
  {
    id: 'parroquia-santo-domingo',
    nombre: 'Parroquia Santo Domingo de Guzmán',
    nombreEn: 'Parish of Santo Domingo de Guzmán',
    nombreZh: '聖多明哥·德古斯曼教區',
    categoria: 'Lugar de culto',
    categoriaEn: 'Place of worship',
    categoriaZh: '宗教場所',
    posicion: [9.9115512, -84.5226294],
    descripcion: 'Lugar de culto identificado en la cartografía abierta de Orotina.',
    descripcionEn: 'Place of worship identified in the open cartography of Orotina.',
    descripcionZh: '在奧羅蒂納開放地圖中識別出的宗教場所。',
    fuente: 'OpenStreetMap',
  },
  {
    id: 'calle-la-estacion',
    nombre: 'Calle La Estación',
    nombreEn: 'La Estación Street',
    nombreZh: '車站街',
    categoria: 'Memoria ferroviaria',
    categoriaEn: 'Railway memory',
    categoriaZh: '鐵路記憶',
    posicion: [9.8968104, -84.5631592],
    descripcion: 'Vía cuyo nombre cartográfico conserva una referencia ferroviaria local.',
    descripcionEn: 'A street whose map name preserves a local railway reference.',
    descripcionZh: '街道名稱保留了當地鐵路歷史的地圖參考。',
    fuente: 'OpenStreetMap',
  },
];

const translations = {
  es: {
    badge: 'Mapa cultural',
    count: 'puntos geolocalizados',
    title: 'Mapa cultural de Orotina',
    description:
      'Explora puntos de interés histórico y cultural de la región. Los nombres y coordenadas proceden de OpenStreetMap; la presencia en el mapa no implica una declaratoria oficial de patrimonio.',
    route: 'Ruta de memoria',
    places: 'Lugares relevantes del cantón',
    cartography: 'Referencia cartográfica',
    location: 'Sede del patrimonio',
    city: 'Orotina, Alajuela',
    points: 'Puntos señalados',
    source: 'Fuente',
    institutional: 'Contexto institucional:',
    ministry: 'directorio del Ministerio de Cultura y Juventud',
    languageLabel: 'Idioma',
  },
  en: {
    badge: 'Cultural map',
    count: 'geolocated points',
    title: 'Cultural map of Orotina',
    description:
      'Explore points of historical and cultural interest in the region. The names and coordinates come from OpenStreetMap; their presence on the map does not constitute an official heritage declaration.',
    route: 'Memory route',
    places: 'Relevant places in the canton',
    cartography: 'Cartographic reference',
    location: 'Heritage headquarters',
    city: 'Orotina, Alajuela',
    points: 'Marked points',
    source: 'Source',
    institutional: 'Institutional context:',
    ministry: 'directory of the Ministry of Culture and Youth',
    languageLabel: 'Language',
  },
  zh: {
    badge: '文化地圖',
    count: '地理定位點',
    title: '奧羅蒂納文化地圖',
    description:
      '探索該地區的歷史和文化興趣點。名稱和座標來自 OpenStreetMap；地圖上的標示不構成官方文化遺產認定。',
    route: '記憶路線',
    places: '該縣的重要地點',
    cartography: '地圖參考',
    location: '文化遺產總部',
    city: '奧羅蒂納，阿拉胡埃拉',
    points: '標示地點',
    source: '來源',
    institutional: '制度背景：',
    ministry: '文化與青年部目錄',
    languageLabel: '語言',
  },
};

function getPointContent(punto, language) {
  if (language === 'en') {
    return {
      nombre: punto.nombreEn,
      categoria: punto.categoriaEn,
      descripcion: punto.descripcionEn,
    };
  }

  if (language === 'zh') {
    return {
      nombre: punto.nombreZh,
      categoria: punto.categoriaZh,
      descripcion: punto.descripcionZh,
    };
  }

  return {
    nombre: punto.nombre,
    categoria: punto.categoria,
    descripcion: punto.descripcion,
  };
}

function RecenterMap() {
  const map = useMap();

  useEffect(() => {
    map.setView(OROTINA_CENTER, 14);
  }, [map]);

  return null;
}

function PuntoMapa({ punto, language, selected, onSelect }) {
  const map = useMap();
  const content = getPointContent(punto, language);

  useEffect(() => {
    if (selected) {
      map.flyTo(punto.posicion, 16, { duration: 1.2, easeLinearity: 0.25 });
    }
  }, [selected, map, punto.posicion]);

  return (
    <CircleMarker
      center={punto.posicion}
      radius={10}
      pathOptions={{
        color: selected ? '#1d4ed8' : '#7B3513',
        fillColor: selected ? '#93c5fd' : '#E9A03B',
        fillOpacity: 0.95,
        weight: selected ? 4 : 3,
      }}
      eventHandlers={{
        click: () => onSelect(punto.id),
      }}
    >
      <Popup>
        <div className="space-y-2">
          <div>
            <strong className="block text-sm text-ink-900">{content.nombre}</strong>
            <span className="text-xs text-ink-500">{content.categoria}</span>
          </div>
          <p className="text-xs leading-relaxed text-ink-600">{content.descripcion}</p>
          <div className="text-xs font-medium text-ink-600">{punto.fuente}</div>
        </div>
      </Popup>
    </CircleMarker>
  );
}

export default function OrotinaMap() {
  const { language, setLanguage } = useLanguage();
  const [selectedPointId, setSelectedPointId] = useState(PUNTOS[0].id);
  const t = translations[language] ?? translations.es;

  return (
    <section aria-labelledby="mapa-orotina-titulo" className="relative mt-14">
      <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-brand-100/80 via-amber-50 to-jade-100 opacity-80 dark:from-brand-950/30 dark:via-ink-800 dark:to-jade-900/30" />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700 shadow-sm backdrop-blur-sm dark:border-brand-800 dark:bg-ink-900/70 dark:text-brand-300">
            <MapPinned aria-hidden="true" className="h-3.5 w-3.5" />
            {t.badge}
          </span>
          <span className="inline-flex items-center rounded-full border border-ink-200 bg-ink-50/80 px-2.5 py-1 text-xs font-medium text-ink-600 dark:border-ink-700 dark:bg-ink-900/70 dark:text-ink-300">
            {PUNTOS.length} {t.count}
          </span>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-ink-200 bg-white/80 p-1 shadow-sm backdrop-blur-sm dark:border-ink-700 dark:bg-ink-900/70">
          <span className="px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-500 dark:text-ink-400">{t.languageLabel}</span>
          {['es', 'en', 'zh'].map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setLanguage(lang)}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                language === lang
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800'
              }`}
            >
              {lang === 'es' ? 'ES' : lang === 'en' ? 'EN' : '繁中'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 text-white shadow-lg shadow-brand-200 dark:shadow-brand-900/40">
          <MapPinned aria-hidden="true" className="h-5 w-5" />
        </div>
        <div>
          <h2 id="mapa-orotina-titulo" className="font-display text-2xl font-bold text-ink-900 dark:text-ink-50">
            {t.title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-600 dark:text-ink-300">
            {t.description}
          </p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-[28px] border border-white/60 bg-white/80 shadow-[0_30px_80px_-40px_rgba(30,64,175,0.55)] backdrop-blur-md dark:border-ink-700 dark:bg-ink-800/80">
        <div className="flex items-center justify-between border-b border-ink-200 bg-gradient-to-r from-brand-50 to-amber-50 px-4 py-3 dark:border-ink-700 dark:from-ink-800 dark:to-ink-900">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-700 dark:text-brand-300">{t.route}</p>
            <p className="text-sm font-medium text-ink-700 dark:text-ink-200">{t.places}</p>
          </div>
          <div className="rounded-full border border-brand-200 bg-white px-2.5 py-1 text-xs font-medium text-brand-700 dark:border-brand-700 dark:bg-brand-900/20 dark:text-brand-300">
            {t.cartography}
          </div>
        </div>

        <div className="relative z-10 h-[min(32rem,78vh)] min-h-80" aria-label="Mapa interactivo de puntos de interés de Orotina">
          <MapContainer center={OROTINA_CENTER} zoom={14} scrollWheelZoom={false} className="leaflet-map-surface z-10">
            <RecenterMap />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {PUNTOS.map((punto) => (
              <PuntoMapa
                key={punto.id}
                punto={punto}
                language={language}
                selected={selectedPointId === punto.id}
                onSelect={setSelectedPointId}
              />
            ))}
          </MapContainer>

          <div className="pointer-events-none absolute left-4 top-4 z-[500] rounded-2xl border border-white/70 bg-white/75 px-3 py-2 shadow-lg shadow-brand-900/10 backdrop-blur-md dark:border-ink-700 dark:bg-ink-900/70">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-500 dark:text-ink-400">{t.location}</p>
            <p className="mt-1 text-sm font-semibold text-ink-800 dark:text-ink-100">{t.city}</p>
          </div>
        </div>

        <div className="border-t border-ink-200 bg-white/60 p-4 dark:border-ink-700 dark:bg-ink-900/50">
          <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-50">{t.points}</h3>
          <ul className="mt-3 grid gap-3 sm:grid-cols-3">
            {PUNTOS.map((punto) => {
              const content = getPointContent(punto, language);
              return (
                <li key={punto.id} className="rounded-2xl border border-ink-200 bg-gradient-to-br from-white to-brand-50/70 p-3 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 dark:border-ink-700 dark:from-ink-800 dark:to-ink-900">
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => setSelectedPointId(punto.id)}
                  >
                    <p className="font-semibold text-ink-800 dark:text-ink-100">{content.nombre}</p>
                    <p className="mt-1 text-xs text-ink-500 dark:text-ink-300">{content.categoria}</p>
                    <p className="mt-2 text-xs font-semibold text-brand-700 dark:text-brand-300">{t.source}: {punto.fuente}</p>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-xs text-ink-500 dark:text-ink-300">
            {t.institutional} <span className="underline">{t.ministry}</span>.
          </p>
        </div>
      </div>
    </section>
  );
}