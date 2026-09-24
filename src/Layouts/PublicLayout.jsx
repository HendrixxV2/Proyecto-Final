import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from '@/Components/common/Navbar';
import Footer from '@/Components/common/Footer';
import AiAssistant from '@/Components/ai/AiAssistant';
import SkipLink from '@/Components/common/SkipLink';

export default function PublicLayout() {
  const { pathname } = useLocation();
  const sectionName = pathname === '/' ? 'Inicio' : pathname.split('/').filter(Boolean).pop()?.replaceAll('-', ' ') ?? 'Sección';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-ink-50 text-ink-900 dark:bg-ink-900 dark:text-ink-100">
      <SkipLink />
      <Navbar />
      <main id="contenido-principal" className="relative flex-1 overflow-x-hidden">
        <div className="site-atmosphere" aria-hidden="true" />
        <div key={pathname} className="page-transition relative">
          <Outlet />
        </div>
      </main>
      <p className="sr-only" aria-live="polite" aria-atomic="true">Sección actual: {sectionName}</p>
      <Footer />
      <AiAssistant />
    </div>
  );
}