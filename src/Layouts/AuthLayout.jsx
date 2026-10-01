import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { PATHS } from '@/Routes/paths';
import BackToTop from '@/Components/Common/BackToTop';

const FONDOS_LOGIN = ['/juanSantaMaria.jpeg', '/landingAlajuela2.jpeg'];
const FONDOS_REGISTRO = ['/landingAlajuela1.jpeg', '/landingAlajuela3.jpeg'];

export default function AuthLayout() {
  const { pathname } = useLocation();
  const [indiceFondo, setIndiceFondo] = useState(0);
  const fondos = pathname === PATHS.login ? FONDOS_LOGIN : FONDOS_REGISTRO;

  useEffect(() => {
    setIndiceFondo(0);
    const intervalo = window.setInterval(() => {
      setIndiceFondo((indice) => (indice + 1) % fondos.length);
    }, 5000);

    return () => window.clearInterval(intervalo);
  }, [pathname, fondos.length]);

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <Link
        to={PATHS.home}
        aria-label={pathname === PATHS.login ? 'Salir del inicio de sesión' : 'Salir del registro'}
        title="Volver al inicio"
        className="fixed right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full border border-ink-200 bg-white/90 text-ink-600 shadow-sm transition hover:bg-ink-100 hover:text-ink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 dark:border-ink-700 dark:bg-ink-800/90 dark:text-ink-200 dark:hover:bg-ink-700"
      >
        <X aria-hidden="true" className="h-5 w-5" />
      </Link>

      <aside className="relative hidden overflow-hidden bg-brand-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        {fondos.map((fondo, indice) => (
          <img
            key={fondo}
            src={fondo}
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${indiceFondo === indice ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-black/65 via-black/40 to-black/70" />
        <Link to="/" className="relative z-10 flex max-w-md items-center gap-3 text-lg font-semibold">
          <img src="/logoOrotina.jpeg" alt="" className="h-12 w-12 shrink-0 rounded-full border border-white/70 object-cover" />
          <span className="font-display leading-snug">Centro Cultural Orotinense Luis Ferrero Acosta</span>
        </Link>

        <blockquote className="relative z-10 max-w-md">
          <p className="font-display text-3xl leading-snug">
            “La cultura es el riel por donde viaja la memoria de un pueblo.”
          </p>
          <footer className="mt-4 text-sm text-brand-100">Centro Cultural Orotinense Luis Ferrero Acosta</footer>
        </blockquote>

        <p className="relative z-10 text-xs text-brand-200">
          Orotina, Alajuela · Antiguo complejo del Ferrocarril al Pacífico
        </p>
      </aside>

      <main id="contenido-principal" className="flex items-center justify-center bg-ink-50 px-6 py-12 dark:bg-ink-900">
        <div key={pathname} className={`page-transition w-full ${pathname === PATHS.login ? 'max-w-xs' : 'max-w-md'}`}>
          <Outlet />
        </div>
      </main>
      <BackToTop />
    </div>
  );
}