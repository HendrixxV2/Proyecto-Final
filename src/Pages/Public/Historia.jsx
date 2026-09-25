import { Coffee, ExternalLink } from 'lucide-react';
import { useFetch } from '@/Hooks/useFetch';
import { useLanguage } from '@/Hooks/useLanguage';
import { contenidoService } from '@/Services/contenidoService';
import SectionTitle from '@/Components/Common/SectionTitle';
import { Skeleton } from '@/Components/UI/Skeleton';
import ErrorState from '@/Components/UI/ErrorState';
import EmptyState from '@/Components/UI/EmptyState';
import OrotinaMap from '@/Components/Common/OrotinaMap';

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

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionTitle
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />

      <article className="relative mt-10 overflow-hidden rounded-sm border-2 border-naranja-700/60 bg-[#f6e8c5] p-1 text-ink-900 shadow-[0_8px_24px_rgb(92_63_0_/_0.16)] dark:border-naranja-400/50 dark:bg-naranja-900/80 dark:text-ink-50">
        <div className="border border-naranja-600/50 px-5 py-7 sm:px-10 sm:py-9">
          <div className="flex items-center justify-center gap-3 text-naranja-700 dark:text-naranja-200">
            <span aria-hidden="true" className="h-px w-12 bg-current sm:w-20" />
            <Coffee aria-hidden="true" className="h-5 w-5" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.28em]">Memoria ferroviaria</span>
            <Coffee aria-hidden="true" className="h-5 w-5" />
            <span aria-hidden="true" className="h-px w-12 bg-current sm:w-20" />
          </div>
          <h2 className="mt-5 text-center font-display text-2xl font-bold text-naranja-900 dark:text-naranja-100 sm:text-3xl">{copy.railwayTitle}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center font-display text-base leading-relaxed text-ink-700 dark:text-ink-100 sm:text-lg">{copy.railwayText}</p>
          <div className="mx-auto mt-6 flex max-w-xs items-center justify-center gap-2 text-naranja-700/70 dark:text-naranja-200/70">
            <span className="h-px flex-1 bg-current" />
            <span aria-hidden="true" className="h-1.5 w-1.5 rotate-45 bg-current" />
            <span className="h-px flex-1 bg-current" />
          </div>
        </div>
      </article>

      <article className="relative mt-6 overflow-hidden rounded-2xl border border-ink-200 bg-ink-900 text-ink-50 shadow-soft dark:border-ink-700 dark:bg-ink-800">
        <img
          src="/rielDeOrotina.jpeg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-ink-900/95 via-ink-900/85 to-ink-900/45" />
        <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-start sm:justify-between sm:p-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-naranja-300">Artículo histórico · ADEPPCO</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">{copy.railwayArticleTitle}</h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-200 sm:text-base">{copy.railwayArticleText}</p>
          </div>
          <a
            href="https://adeppco.com/2025/10/07/el-tren-que-cambio-la-historia-de-orotina/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-naranja-400/60 px-4 py-2.5 text-sm font-semibold text-naranja-200 transition hover:border-naranja-300 hover:bg-naranja-400/10"
          >
            {copy.railwayArticleLink}
            <ExternalLink aria-hidden="true" className="h-4 w-4" />
          </a>
        </div>
      </article>

      <div className="mt-10 space-y-10">
        {loading && (
          <>
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </>
        )}

        {error && !loading && <ErrorState onRetry={refetch} />}

        {!loading && !error && data?.length === 0 && (
          <EmptyState title={copy.loadingTitle} description={copy.loadingDesc} />
        )}

        {!loading &&
          data?.map((bloque, index) => (
            <article key={bloque.id} className="relative border-l-2 border-brand-200 pl-6 dark:border-brand-800">
              <span
                aria-hidden="true"
                className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-brand-500"
              />
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">
                {copy.chapter} {index + 1}
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold text-ink-900 dark:text-ink-50">{getLocalizedBlock(bloque, language).title}</h2>
              <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-ink-700 dark:text-ink-200">{getLocalizedBlock(bloque, language).body}</p>
            </article>
          ))}
      </div>

      <div className="mt-14 rounded-[2rem] border border-brand-200 bg-gradient-to-br from-brand-50 via-amber-50 to-jade-50 p-6 shadow-soft dark:border-brand-800 dark:from-brand-950/30 dark:via-ink-800 dark:to-jade-950/30">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700 dark:text-brand-300">{copy.originTitle}</p>
        <p className="mt-4 text-base leading-relaxed text-ink-700 dark:text-ink-200">{copy.originText}</p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-soft dark:border-ink-700 dark:bg-ink-800">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jade-700 dark:text-jade-300">{copy.extraTitle}</p>
          <p className="mt-3 text-sm leading-relaxed text-ink-600 dark:text-ink-300">{copy.extraText}</p>
        </div>

        <div className="rounded-2xl border border-ink-200 bg-gradient-to-br from-ink-900 to-brand-900 p-5 text-ink-50 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">{language === 'en' ? 'Legacy' : language === 'zh' ? '遺產' : 'Legado'}</p>
          <p className="mt-3 text-sm leading-relaxed text-ink-100/90">
            {language === 'en'
              ? 'Orotina lives on in its toponyms, songs, trade routes and the memory of those who turned the railway into a horizon of social life.'
              : language === 'zh'
                ? '奧羅蒂納的故事仍保存在地名、歌謠、貿易路線與那些把鐵路轉化為社會生活視野的人們的記憶中。'
                : 'Orotina vive en sus topónimos, canciones, rutas de comercio y en la memoria de quienes transformaron el ferrocarril en horizonte de vida social.'}
          </p>
        </div>
      </div>

      <blockquote className="mt-14 rounded-2xl bg-jade-700 p-8 text-jade-50">
        <p className="font-display text-xl leading-snug sm:text-2xl">
          “Luis Ferrero Acosta dejó en su obra el testimonio de un pueblo que aprendió a mirar el mundo desde el riel.”
        </p>
        <footer className="mt-3 text-xs text-jade-200">Centro Cultural Orotinense</footer>
      </blockquote>

      <OrotinaMap />
    </div>
  );
}