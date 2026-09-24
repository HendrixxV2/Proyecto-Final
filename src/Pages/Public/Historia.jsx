import { useFetch } from '@/Hooks/useFetch';
import { useLanguage } from '@/Hooks/useLanguage';
import { contenidoService } from '@/Services/contenidoService';
import SectionTitle from '@/Components/common/SectionTitle';
import { Skeleton } from '@/Components/ui/Skeleton';
import ErrorState from '@/Components/ui/ErrorState';
import EmptyState from '@/Components/ui/EmptyState';
import OrotinaMap from '@/Components/Common/OrotinaMap';

const HISTORY_COPY = {
  es: {
    eyebrow: 'Memoria y patrimonio',
    title: 'Historia de Orotina',
    description: 'Un recorrido por el cantón que creció al ritmo del Ferrocarril al Pacífico.',
    loadingTitle: 'Contenido en preparación',
    loadingDesc: 'Estamos digitalizando el archivo histórico del cantón.',
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