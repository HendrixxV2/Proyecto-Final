import { useRef, useState } from 'react';
import { BookOpen, ExternalLink, Flower2, Landmark, MapPinned, Sparkles, TrainFront } from 'lucide-react';
import { useFetch } from '@/Hooks/useFetch';
import { useLanguage } from '@/Hooks/useLanguage';
import { contenidoService } from '@/Services/contenidoService';
import { Skeleton } from '@/Components/UI/Skeleton';
import ErrorState from '@/Components/UI/ErrorState';
import EmptyState from '@/Components/UI/EmptyState';
import OrotinaMap from '@/Components/Common/OrotinaMap';
import './Historia.css';

const HISTORY_COPY = {
  es: {
    eyebrow: 'Memoria y patrimonio',
    title: 'Historia de Orotina',
    description: 'Un recorrido por el cantón que creció al ritmo del Ferrocarril al Pacífico.',
    loadingTitle: 'Contenido en preparación',
    loadingDesc: 'Estamos digitalizando el archivo histórico del cantón.',
    railwayTitle: 'El riel que abrió el camino',
    railwayText: 'El ferrocarril llegó a Orotina en 1903, transformando las Llanuras de Santo Domingo de un territorio aislado en un centro estratégico conectado a la economía nacional. La llegada de los rieles impulsó la exportación de café y oro, atrajo migración y generó un auge comercial alrededor de la estación. Hoy, la asociación ADEPPCO trabaja para preservar esta memoria histórica y el patrimonio cultural que el tren dejó en la región.',
    railwayArticleTitle: 'El tren que cambió la historia de Orotina',
    railwayArticleText: 'Antes del ferrocarril, boyeros, campesinos y pioneros abrieron las rutas hacia las llanuras de Santo Domingo. Cuando el tren llegó en 1903, la estación se convirtió en un centro social y comercial: conectó cosechas y minerales con los puertos, atrajo nuevos pobladores y dejó una huella que ADEPPCO trabaja por conservar.',
    railwayArticleLink: 'Leer artículo completo en ADEPPCO',
    chapter: 'Capítulo',
    chaptersLabel: 'Elige un capítulo para recorrer la memoria del cantón',
    originTag: 'Raíces indígenas',
    railwayTag: 'Ferrocarril al Pacífico',
    communityTag: 'Caminos de encuentro',
    archiveTag: 'Archivo local',
    openArticle: 'Leer historia completa',
    originTitle: 'El nombre del cantón',
    originText: 'La palabra Orotina proviene directamente del nombre del cacique o rey indígena Orotina (o Gurutina), quien gobernaba las tierras desde la ensenada de Tivives hacia el interior durante los primeros contactos con los conquistadores españoles en 1522. Esa raíz política y territorial no es solo un nombre: es una huella de soberanía, navegación y asentamiento que aún acompaña la memoria del cantón.',
    extraTitle: 'Un pueblo de confluencias',
    extraText: 'Antes de consolidarse como cantón, Orotina se configuró como un punto de encuentro entre comunidades indígenas, caminos de paso, comercio costero y la expansión del ferrocarril. La mezcla de robores, caminos de tierra, estaciones y redes de vida cotidiana dio forma a un territorio donde la memoria no se guarda solo en documentos, sino también en los nombres de las calles, la música, la cocina y la forma de habitar el paisaje.',
  },
  en: {
    eyebrow: 'Memory and heritage',
    title: 'History of Orotina',
    description: 'A journey through the canton that grew to the rhythm of the Pacific Railway.',
    loadingTitle: 'Content in preparation',
    loadingDesc: 'We are digitizing the historical archive of the canton.',
    railwayTitle: 'The railway that opened the way',
    railwayText: 'The railway reached Orotina in 1903, transforming the Santo Domingo Plains from an isolated territory into a strategic center connected to the national economy. The rails boosted coffee and gold exports, attracted migration and sparked a commercial boom around the station. Today, the ADEPPCO association works to preserve this historical memory and the cultural heritage left by the train in the region.',
    railwayArticleTitle: 'The train that changed Orotina’s history',
    railwayArticleText: 'Before the railway, farmers, ox-cart drivers and pioneers opened routes into the Santo Domingo Plains. When the train arrived in 1903, the station became a social and commercial center, connecting crops and minerals to the ports, attracting new residents and leaving a legacy that ADEPPCO works to preserve.',
    railwayArticleLink: 'Read the full article at ADEPPCO',
    chapter: 'Chapter',
    chaptersLabel: 'Choose a chapter to explore the canton’s memory',
    originTag: 'Indigenous roots',
    railwayTag: 'Pacific Railway',
    communityTag: 'Crossroads',
    archiveTag: 'Local archive',
    openArticle: 'Read the full story',
    originTitle: 'The name of the canton',
    originText: 'The word Orotina comes directly from the name of the indigenous cacique or king Orotina (or Gurutina), who ruled the lands from the Tivives inlet to the interior during the first contacts with Spanish conquistadors in 1522. That political and territorial root is more than a name: it is a trace of sovereignty, navigation and settlement that still accompanies the canton’s memory.',
    extraTitle: 'A town of confluences',
    extraText: 'Before becoming a canton, Orotina emerged as a meeting point between Indigenous communities, transit routes, coastal trade and the expansion of the railway. The mix of oak groves, dirt roads, stations and everyday life shaped a territory where memory is kept not only in documents, but also in street names, music, food and the way of inhabiting the landscape.',
  },
  zh: {
    eyebrow: '記憶與遺產',
    title: '奧羅蒂納歷史',
    description: '探訪這個隨著太平洋鐵路成長的縣份。',
    loadingTitle: '內容準備中',
    loadingDesc: '我們正在數位化該縣的歷史檔案。',
    railwayTitle: '開啟道路的鐵路',
    railwayText: '鐵路於 1903 年抵達奧羅蒂納，將聖多明哥平原從偏遠地區轉變為與國家經濟相連的戰略中心。鐵軌帶動了咖啡與黃金出口，吸引移民，並在車站周圍形成商業繁榮。如今，ADEPPCO 協會致力於保存這段歷史記憶，以及火車在該地區留下的文化遺產。',
    railwayArticleTitle: '改變奧羅蒂納歷史的火車',
    railwayArticleText: '在鐵路出現以前，農民、牛車夫與先驅者開闢了通往聖多明哥平原的道路。火車於 1903 年抵達後，車站成為社會與商業中心，連結農作物、礦產與港口，也吸引新居民，留下 ADEPPCO 持續保存的文化記憶。',
    railwayArticleLink: '在 ADEPPCO 閱讀完整文章',
    chapter: '章節',
    chaptersLabel: '選擇章節，探索縣份的記憶',
    originTag: '原住民根源',
    railwayTag: '太平洋鐵路',
    communityTag: '交會之路',
    archiveTag: '地方檔案',
    openArticle: '閱讀完整故事',
    originTitle: '縣名由來',
    originText: '「Orotina」一詞直接源自原住民首領或國王 Orotina（或 Gurutina）之名，他在 1522 年與西班牙征服者首次接觸時，統治著從 Tivives 海灣延伸至內陸的土地。這個政治與地域的根源不只是名稱，而是一種主權、航行與定居的痕跡，至今仍陪伴著該縣的記憶。',
    extraTitle: '交匯之地',
    extraText: '在成為縣份之前，奧羅蒂納曾是原住民社群、交通路線、沿海貿易與鐵路擴展交會之地。橡樹林、土路、車站與日常生活的交織，塑造出一個不僅存在於文件中的記憶，也藏在街道名稱、音樂、飲食與風景居住方式中的地域。',
  },
};

function getLocalizedBlock(block, language) {
  return {
    title: language === 'en' ? block.tituloEn ?? block.titulo : language === 'zh' ? block.tituloZh ?? block.titulo : block.titulo,
    body: language === 'en' ? block.cuerpoEn ?? block.cuerpo : language === 'zh' ? block.cuerpoZh ?? block.cuerpo : block.cuerpo,
  };
}

export default function Historia() {
  const { data, loading, error, refetch } = useFetch(() => contenidoService.bySeccion('historia'), []);
  const { language } = useLanguage();
  const copy = HISTORY_COPY[language] ?? HISTORY_COPY.es;
  const [activeChapter, setActiveChapter] = useState('railway');
  const chapterTabRefs = useRef([]);
  const chapters = [
    {
      id: 'origin',
      period: '1522',
      label: copy.originTag,
      title: copy.originTitle,
      body: copy.originText,
      image: '/gurutina.jpeg',
      Icon: Landmark,
    },
    {
      id: 'railway',
      period: '1903',
      label: copy.railwayTag,
      title: copy.railwayTitle,
      body: copy.railwayText,
      image: '/ferrorotina.jpeg',
      Icon: TrainFront,
    },
    {
      id: 'community',
      period: language === 'en' ? 'Then & now' : language === 'zh' ? '昔日與今日' : 'Ayer y hoy',
      label: copy.communityTag,
      title: copy.extraTitle,
      body: copy.extraText,
      image: '/confluencias.jpeg',
      Icon: MapPinned,
    },
    ...(data ?? []).map((block, index) => {
      const localized = getLocalizedBlock(block, language);
      return {
        id: `archive-${block.id}`,
        period: `${copy.chapter} ${index + 1}`,
        label: copy.archiveTag,
        title: localized.title,
        body: localized.body,
        image: block.titulo === 'Orotina y el Ferrocarril al Pacífico'
          ? '/imgCarga138.jpeg'
          : ['/Ferrocarril.jpeg', '/Orotina_Pavilion._Costa_Rica.jpeg', '/ferropacifico.jpeg'][index % 3],
        Icon: BookOpen,
      };
    }),
  ];
  const selectedIndex = Math.max(0, chapters.findIndex((chapter) => chapter.id === activeChapter));
  const selectedChapter = chapters[selectedIndex];

  const handleChapterKeyDown = (event, index) => {
    let nextIndex = index;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % chapters.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + chapters.length) % chapters.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = chapters.length - 1;
    else return;

    event.preventDefault();
    setActiveChapter(chapters[nextIndex].id);
    chapterTabRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="historia-page">
      <div className="historia-page__photo" aria-hidden="true" />
      <div className="historia-page__frame" aria-hidden="true">
        <div className="historia-flourish historia-flourish--top-left"><Flower2 /><Sparkles /><Flower2 /></div>
        <div className="historia-flourish historia-flourish--top-right"><Flower2 /><Sparkles /><Flower2 /></div>
        <div className="historia-flourish historia-flourish--bottom-left"><Flower2 /><Sparkles /><Flower2 /></div>
        <div className="historia-flourish historia-flourish--bottom-right"><Flower2 /><Sparkles /><Flower2 /></div>
      </div>

      <div className="historia-content">
        <header className="historia-heading">
          <p className="historia-eyebrow"><Flower2 aria-hidden="true" />{copy.eyebrow}<Flower2 aria-hidden="true" /></p>
          <h1>{copy.title}</h1>
          <p className="historia-heading__description">{copy.description}</p>
          <span className="historia-heading__rule" aria-hidden="true"><span /></span>
        </header>

        <section className="historia-journey" aria-labelledby="historia-journey-title">
          <div className="historia-section-heading">
            <div>
              <p className="historia-kicker">01 <span>/</span> {copy.eyebrow}</p>
              <h2 id="historia-journey-title">{copy.chaptersLabel}</h2>
            </div>
            <span className="historia-chapter-count">{String(chapters.length).padStart(2, '0')} {language === 'en' ? 'chapters' : language === 'zh' ? '章節' : 'capítulos'}</span>
          </div>

          <div className="historia-tabs" role="tablist" aria-label={copy.chaptersLabel}>
            {chapters.map((chapter, index) => {
              const ChapterIcon = chapter.Icon;
              const isActive = selectedIndex === index;
              return (
                <button
                  key={chapter.id}
                  ref={(element) => { chapterTabRefs.current[index] = element; }}
                  id={`historia-tab-${index}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="historia-panel"
                  tabIndex={isActive ? 0 : -1}
                  className={`historia-tab${isActive ? ' historia-tab--active' : ''}`}
                  onClick={() => setActiveChapter(chapter.id)}
                  onKeyDown={(event) => handleChapterKeyDown(event, index)}
                >
                  <span className="historia-tab__topline">
                    <ChapterIcon aria-hidden="true" />
                    <span>{String(index + 1).padStart(2, '0')}</span>
                  </span>
                  <strong>{chapter.title}</strong>
                  <span className="historia-tab__period">{chapter.period}</span>
                </button>
              );
            })}
          </div>

          <div
            key={selectedChapter.id}
            id="historia-panel"
            role="tabpanel"
            aria-labelledby={`historia-tab-${selectedIndex}`}
            tabIndex={0}
            className="historia-feature"
          >
            <div className="historia-feature__image-wrap">
              <img src={selectedChapter.image} alt={selectedChapter.title} className="historia-feature__image" />
              <span className="historia-feature__date">{selectedChapter.period}</span>
              <span className="historia-feature__image-mark" aria-hidden="true"><Flower2 /></span>
            </div>
            <div className="historia-feature__copy">
              <p className="historia-feature__label"><span />{selectedChapter.label}</p>
              <h2>{selectedChapter.title}</h2>
              <p className="historia-feature__body">{selectedChapter.body}</p>
              {selectedChapter.id === 'railway' && (
                <a
                  href="https://adeppco.com/2025/10/07/el-tren-que-cambio-la-historia-de-orotina/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="historia-feature__link"
                >
                  {copy.openArticle}<ExternalLink aria-hidden="true" />
                </a>
              )}
              <p className="historia-feature__index">{copy.chapter} {String(selectedIndex + 1).padStart(2, '0')} <span /> {selectedChapter.period}</p>
            </div>
          </div>
        </section>

        <section className="historia-archive" aria-label={copy.archiveTag}>
          {loading && (
            <div className="historia-loading" aria-label={copy.loadingTitle}>
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-40 w-full rounded-xl" />
            </div>
          )}
          {error && !loading && <ErrorState onRetry={refetch} />}
          {!loading && !error && data?.length === 0 && (
            <EmptyState title={copy.loadingTitle} description={copy.loadingDesc} />
          )}
        </section>

        <blockquote className="historia-quote">
          <Sparkles aria-hidden="true" />
          <p>“Luis Ferrero Acosta dejó en su obra el testimonio de un pueblo que aprendió a mirar el mundo desde el riel.”</p>
          <footer>Centro Cultural Orotinense</footer>
        </blockquote>

        <div className="historia-map"><OrotinaMap /></div>
      </div>
    </div>
  );
}