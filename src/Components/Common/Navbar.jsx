import { useEffect, useState } from 'react';
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

const NAV_ITEMS = [
  { to: PATHS.home, key: 'home' },
  { to: PATHS.calendario, key: 'calendar' },
  { to: PATHS.espacios, key: 'spaces' },
  { to: PATHS.boletos, key: 'tickets' },
  { to: PATHS.artes, key: 'arts' },
  { to: PATHS.galeria, key: 'gallery' },
  { to: PATHS.historia, key: 'history' },
  { to: PATHS.noticias, key: 'news' },
];

const LANGUAGE_OPTIONS = [
  { id: 'es', label: 'ES' },
  { id: 'en', label: 'EN' },
  { id: 'zh', label: '繁中' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const NAV = NAV_ITEMS.map((item) => ({ ...item, label: t(`common.${item.key}`) }));
  const isRegularUser = isAuthenticated && !isAdmin;

  useEffect(() => {
    const updateScrollState = () => setScrolled(window.scrollY > 32);
    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollState);
  }, []);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate(PATHS.home);
  };

  return (
    <header className={cn('sticky top-0 z-40 border-b border-ink-200/70 bg-ink-50/95 shadow-sm backdrop-blur-xl transition-all duration-300 dark:border-ink-700/70 dark:bg-ink-900/95', scrolled && 'shadow-md')}>
      <nav aria-label={t('common.mainNavigation')} className={cn('mx-auto grid max-w-[90rem] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 sm:gap-4 sm:px-6 lg:px-8 xl:grid-rows-[auto_auto] xl:gap-x-6 xl:gap-y-1', scrolled ? 'min-h-12 py-1 xl:grid-cols-[auto_minmax(0,1fr)_auto] xl:grid-rows-1 xl:gap-y-0' : 'min-h-16 py-2 xl:grid-cols-[auto_minmax(0,1fr)]')}>
        <Link to={PATHS.home} className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3" aria-label="Ir al inicio">
          <span className={cn('relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-ink-200/70 transition-all duration-300 dark:ring-ink-700', scrolled ? 'h-8 w-8' : 'h-10 w-10 sm:h-11 sm:w-11')}>
            <Landmark aria-hidden="true" className="h-5 w-5 text-brand-500 sm:h-6 sm:w-6" />
            <img
              src="/logoOrotina.jpeg"
              alt=""
              onError={(event) => { event.currentTarget.style.display = 'none'; }}
              className={cn('absolute scale-[1.24] object-cover object-center', scrolled ? 'h-8 w-8' : 'h-10 w-10 sm:h-11 sm:w-11')}
            />
          </span>
          <span className={cn('min-w-0 max-w-[13rem] font-brand text-[11px] font-bold leading-[1.1] text-ink-900 transition-all duration-300 sm:max-w-[15rem] sm:text-sm dark:text-ink-50', scrolled && 'sm:text-xs')}>
            <span className="block truncate">Centro Cultural Orotinense</span>
            <span className={cn('mt-0.5 block truncate text-[9px] font-medium leading-tight text-ink-500 transition-all duration-300 sm:text-[11px] dark:text-ink-400', scrolled && 'hidden')}>
              Luis Ferrero Acosta
            </span>
          </span>
        </Link>

        <ul className={cn('hidden min-w-0 items-center justify-center gap-1 px-1 xl:flex', scrolled ? 'xl:col-span-1 xl:row-start-1 xl:flex-nowrap xl:overflow-hidden' : 'xl:col-span-2 xl:row-start-2 xl:flex-wrap xl:overflow-visible xl:pb-1')} aria-label={t('common.publicSections')}>
          {NAV.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === PATHS.home}
                className={({ isActive }) =>
                  cn(
                    'relative whitespace-nowrap rounded-lg px-2 py-2 text-xs font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm',
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

        <div className={cn('col-start-2 row-start-1 flex shrink-0 items-center gap-2', scrolled ? 'xl:col-start-3 xl:justify-self-end' : 'xl:col-start-2 xl:justify-self-end')}>
          <div className="hidden items-center gap-1 rounded-xl border border-ink-200 bg-white p-1 shadow-sm transition-shadow duration-300 hover:shadow-md dark:border-ink-700 dark:bg-ink-800 lg:flex">
            <span className="px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-500 dark:text-ink-400">{LANGUAGE_OPTIONS.find((option) => option.id === language)?.label ?? 'ES'}</span>
            {LANGUAGE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setLanguage(option.id)}
                className={cn(
                  'rounded-lg px-2 py-1 text-[11px] font-semibold transition-all duration-200 hover:-translate-y-0.5',
                  language === option.id
                    ? 'bg-brand-500 text-white'
                    : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-700',
                )}
                aria-label={`${t('common.changeLanguage')} ${option.label}`}
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
                  {t('common.panel')}
                </Button>
              )}
              {isRegularUser && (
                <Button as={Link} to={PATHS.misReservas} variant="ghost" size="sm">
                  <User aria-hidden="true" className="h-4 w-4" />
                  {user.nombre.split(' ')[0]}
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={handleLogout} aria-label={t('common.logout')}>
                <LogOut aria-hidden="true" className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Button as={Link} to={PATHS.login} variant="ghost" size="sm">{t('common.login')}</Button>
              <Button as={Link} to={PATHS.registro} size="sm">{t('common.signup')}</Button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label={open ? t('common.closeMenu') : t('common.openMenu')}
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
                      'block rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:translate-x-1',
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
            <ThemeToggle compact />
            <FontSizeControl />
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Button as={Link} to={PATHS.admin.dashboard} variant="outline" onClick={() => setOpen(false)}>
                    {t('common.adminPanel')}
                  </Button>
                )}
                {isRegularUser && (
                  <Button as={Link} to={PATHS.misReservas} variant="outline" onClick={() => setOpen(false)}>
                    {t('common.myBookings')}
                  </Button>
                )}
                <Button variant="danger" onClick={handleLogout}>{t('common.logout')}</Button>
              </>
            ) : (
              <>
                <Button as={Link} to={PATHS.login} variant="outline" onClick={() => setOpen(false)}>{t('common.login')}</Button>
                <Button as={Link} to={PATHS.registro} onClick={() => setOpen(false)}>{t('common.signup')}</Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}