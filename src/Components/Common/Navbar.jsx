import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Landmark, LogOut, Menu, Shield, User, X } from 'lucide-react';
import { PATHS } from '@/Routes/paths';
import { useAuth } from '@/Hooks/useAuth';
import { useLanguage } from '@/Hooks/useLanguage';
import { cn } from '@/Utils/cn';
import Button from '@/Components/UI/Button';
import ThemeToggle from '@/Components/UI/ThemeToggle';
import FontSizeControl from '@/Components/UI/FontSizeControl';
import AccessibilityPanel from '@/Components/UI/AccessibilityPanel';

const NAV_BY_LANGUAGE = {
  es: [
    { to: PATHS.home, label: 'Inicio' },
    { to: PATHS.calendario, label: 'Calendario' },
    { to: PATHS.espacios, label: 'Espacios' },
    { to: PATHS.boletos, label: 'Boletos' },
    { to: PATHS.artes, label: 'Teatro · Baile · Canto' },
    { to: PATHS.galeria, label: 'Galería Ferrocarril' },
    { to: PATHS.historia, label: 'Historia' },
    { to: PATHS.noticias, label: 'Noticias' },
  ],
  en: [
    { to: PATHS.home, label: 'Home' },
    { to: PATHS.calendario, label: 'Calendar' },
    { to: PATHS.espacios, label: 'Spaces' },
    { to: PATHS.boletos, label: 'Tickets' },
    { to: PATHS.artes, label: 'Theater · Dance · Song' },
    { to: PATHS.galeria, label: 'Railway Gallery' },
    { to: PATHS.historia, label: 'History' },
    { to: PATHS.noticias, label: 'News' },
  ],
  zh: [
    { to: PATHS.home, label: '首頁' },
    { to: PATHS.calendario, label: '日曆' },
    { to: PATHS.espacios, label: '空間' },
    { to: PATHS.boletos, label: '門票' },
    { to: PATHS.artes, label: '戲劇 · 舞蹈 · 歌唱' },
    { to: PATHS.galeria, label: '鐵路畫廊' },
    { to: PATHS.historia, label: '歷史' },
    { to: PATHS.noticias, label: '新聞' },
  ],
};

const LANGUAGE_OPTIONS = [
  { id: 'es', label: 'ES' },
  { id: 'en', label: 'EN' },
  { id: 'zh', label: '繁中' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const NAV = NAV_BY_LANGUAGE[language] ?? NAV_BY_LANGUAGE.es;

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate(PATHS.home);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200/70 bg-ink-50/85 backdrop-blur-md dark:border-ink-700/70 dark:bg-ink-900/85">
      <nav aria-label="Navegación principal" className="mx-auto flex min-h-16 max-w-7xl items-center gap-3 px-3 py-2 sm:gap-4 sm:px-6 lg:px-8">
        <Link to={PATHS.home} className="flex min-w-0 flex-1 items-center gap-2 sm:flex-none" aria-label="Ir al inicio">
          <span className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-ink-200/70 sm:h-11 sm:w-11 dark:ring-ink-700">
            <Landmark aria-hidden="true" className="h-5 w-5 text-brand-500 sm:h-6 sm:w-6" />
            <img
              src="/logoOrotina.jpeg"
              alt=""
              onError={(event) => { event.currentTarget.style.display = 'none'; }}
              className="absolute h-10 w-10 scale-[1.24] object-cover object-center sm:h-11 sm:w-11"
            />
          </span>
          <span className="min-w-0 font-brand text-[11px] font-bold leading-[1.1] text-ink-900 sm:text-sm dark:text-ink-50">
            <span className="block break-words">Centro Cultural Orotinense</span>
            <span className="mt-0.5 block break-words text-[9px] font-medium leading-tight text-ink-500 sm:text-[11px] dark:text-ink-400">
              Luis Ferrero Acosta
            </span>
          </span>
        </Link>

        <ul className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 xl:flex">
          {NAV.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === PATHS.home}
                className={({ isActive }) =>
                  cn(
                    'whitespace-nowrap rounded-lg px-2 py-2 text-xs font-medium transition',
                    isActive
                      ? 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-200'
                      : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-ink-50',
                  )
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-1 rounded-xl border border-ink-200 bg-white p-1 dark:border-ink-700 dark:bg-ink-800 2xl:flex">
            <span className="px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-500 dark:text-ink-400">{language === 'es' ? 'ES' : language === 'en' ? 'EN' : '繁中'}</span>
            {LANGUAGE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setLanguage(option.id)}
                className={cn(
                  'rounded-lg px-2 py-1 text-[11px] font-semibold transition',
                  language === option.id
                    ? 'bg-brand-500 text-white'
                    : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-700',
                )}
                aria-label={`Cambiar idioma a ${option.label}`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="hidden 2xl:block">
            <AccessibilityPanel />
          </div>
          <div className="hidden 2xl:block">
            <FontSizeControl />
          </div>
          <div className="hidden md:block">
            <ThemeToggle compact />
          </div>

          {isAuthenticated ? (
            <div className="hidden items-center gap-2 md:flex">
              {isAdmin && (
                <Button as={Link} to={PATHS.admin.dashboard} variant="outline" size="sm">
                  <Shield aria-hidden="true" className="h-4 w-4" />
                  {language === 'en' ? 'Panel' : language === 'zh' ? '控制台' : 'Panel'}
                </Button>
              )}
              <Button as={Link} to={PATHS.misReservas} variant="ghost" size="sm">
                <User aria-hidden="true" className="h-4 w-4" />
                {user.nombre.split(' ')[0]}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout} aria-label={language === 'en' ? 'Log out' : language === 'zh' ? '登出' : 'Cerrar sesión'}>
                <LogOut aria-hidden="true" className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Button as={Link} to={PATHS.login} variant="ghost" size="sm">{language === 'en' ? 'Log in' : language === 'zh' ? '登入' : 'Ingresar'}</Button>
              <Button as={Link} to={PATHS.registro} size="sm">{language === 'en' ? 'Sign up' : language === 'zh' ? '註冊' : 'Registrarse'}</Button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            className="rounded-lg p-2 text-ink-700 transition hover:bg-ink-100 xl:hidden dark:text-ink-200 dark:hover:bg-ink-800"
          >
            {open ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div id="menu-movil" className="border-t border-ink-200 bg-ink-50 px-4 pb-5 pt-3 xl:hidden dark:border-ink-700 dark:bg-ink-900">
          <ul className="space-y-1">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === PATHS.home}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'block rounded-lg px-3 py-2.5 text-sm font-medium',
                      isActive
                        ? 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-200'
                        : 'text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-ink-200 pt-4 dark:border-ink-700">
            <div className="inline-flex items-center gap-1 rounded-xl border border-ink-200 bg-white p-1 dark:border-ink-700 dark:bg-ink-800">
              {LANGUAGE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setLanguage(option.id);
                    setOpen(false);
                  }}
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-xs font-semibold transition',
                    language === option.id
                      ? 'bg-brand-500 text-white'
                      : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-700',
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <ThemeToggle />
            <FontSizeControl />
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Button as={Link} to={PATHS.admin.dashboard} variant="outline" onClick={() => setOpen(false)}>
                    {language === 'en' ? 'Admin panel' : language === 'zh' ? '管理面板' : 'Panel administrativo'}
                  </Button>
                )}
                <Button as={Link} to={PATHS.misReservas} variant="outline" onClick={() => setOpen(false)}>
                  {language === 'en' ? 'My bookings' : language === 'zh' ? '我的預約' : 'Mis reservas'}
                </Button>
                <Button variant="danger" onClick={handleLogout}>{language === 'en' ? 'Log out' : language === 'zh' ? '登出' : 'Cerrar sesión'}</Button>
              </>
            ) : (
              <>
                <Button as={Link} to={PATHS.login} variant="outline" onClick={() => setOpen(false)}>{language === 'en' ? 'Log in' : language === 'zh' ? '登入' : 'Ingresar'}</Button>
                <Button as={Link} to={PATHS.registro} onClick={() => setOpen(false)}>{language === 'en' ? 'Sign up' : language === 'zh' ? '註冊' : 'Registrarse'}</Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}