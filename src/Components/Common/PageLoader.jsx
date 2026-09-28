import { Landmark } from 'lucide-react';
import { useLanguage } from '@/Hooks/useLanguage';

export default function PageLoader() {
  const { t } = useLanguage();
  return (
    <div className="grid min-h-[70vh] place-items-center bg-ink-50 dark:bg-ink-900" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4">
        <span className="grid h-14 w-14 animate-pulse place-items-center rounded-2xl bg-brand-500 text-white">
          <Landmark aria-hidden="true" className="h-7 w-7" />
        </span>
        <p className="text-sm text-ink-500 dark:text-ink-400">{t('ui.loadingSection')}</p>
      </div>
    </div>
  );
}