import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { useLanguage } from '@/Hooks/useLanguage';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const actualizarVisibilidad = () => setVisible(window.scrollY > 320);
    actualizarVisibilidad();
    window.addEventListener('scroll', actualizarVisibilidad, { passive: true });
    return () => window.removeEventListener('scroll', actualizarVisibilidad);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label={t('voice.backToTop')}
      title={t('voice.backToTop')}
      className="fixed bottom-5 left-5 z-40 grid h-11 w-11 place-items-center rounded-full border border-ink-200 bg-white text-ink-700 shadow-lg transition hover:bg-ink-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 dark:border-ink-600 dark:bg-ink-800 dark:text-ink-100 dark:hover:bg-ink-700"
    >
      <ArrowUp aria-hidden="true" className="h-5 w-5" />
    </button>
  );
}