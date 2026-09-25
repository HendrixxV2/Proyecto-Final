import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from '@/Components/Common/Navbar';
import Footer from '@/Components/Common/Footer';
import AiAssistant from '@/Components/AI/AiAssistant';
import SkipLink from '@/Components/Common/SkipLink';

export default function PublicLayout() {
  const { pathname } = useLocation();
  const sectionName = pathname === '/' ? 'Inicio' : pathname.split('/').filter(Boolean).pop()?.replaceAll('-', ' ') ?? 'Sección';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  useEffect(() => {
    const sections = document.querySelectorAll('#contenido-principal section, #contenido-principal article');
    if (!sections.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-ink-50 text-ink-900 dark:bg-ink-900 dark:text-ink-100">
      <SkipLink />
      <Navbar />
      <main id="contenido-principal" className="relative min-h-0 flex-1 overflow-x-clip">
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