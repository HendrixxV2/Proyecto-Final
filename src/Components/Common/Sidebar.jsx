import { NavLink, Link } from 'react-router-dom';
import {
  CalendarClock, CalendarDays, ChevronLeft, FileText, LayoutDashboard, Landmark,
  MapPinned, Newspaper, Ticket, Users, X, BarChart3,
} from 'lucide-react';
import { PATHS } from '@/Routes/paths';
import { cn } from '@/Utils/cn';
import { useLanguage } from '@/Hooks/useLanguage';

const SECCIONES = [
  {
    titulo: 'summary',
    items: [{ to: PATHS.admin.dashboard, label: 'dashboard', Icon: LayoutDashboard }],
  },
  {
    titulo: 'operation',
    items: [
      { to: PATHS.admin.reservas, label: 'reservations', Icon: CalendarClock },
      { to: PATHS.admin.disponibilidad, label: 'availability', Icon: CalendarDays },
      { to: PATHS.admin.boletos, label: 'tickets', Icon: Ticket },
    ],
  },
  {
    titulo: 'catalog',
    items: [
      { to: PATHS.admin.espacios, label: 'spaces', Icon: MapPinned },
      { to: PATHS.admin.eventos, label: 'events', Icon: Landmark },
      { to: PATHS.admin.contenido, label: 'content', Icon: Newspaper },
    ],
  },
  {
    titulo: 'administration',
    items: [
      { to: PATHS.admin.usuarios, label: 'users', Icon: Users },
      { to: PATHS.admin.reportes, label: 'reports', Icon: BarChart3 },
    ],
  },
];

export default function Sidebar({ collapsed, mobileOpen, onCloseMobile, onToggleCollapse }) {
  const { t } = useLanguage();
  const content = (
    <>
      <div className="admin-sidebar__brand flex h-16 items-center gap-2.5 border-b border-ink-200 px-4 dark:border-ink-700">
        <Link to={PATHS.home} className="flex min-w-0 items-center gap-2.5" onClick={onCloseMobile}>
          <img src="/logoOrotina.jpeg" alt="" className="admin-sidebar__logo h-9 w-9 shrink-0 rounded-full object-cover object-center" />
          {!collapsed && (
            <span className="admin-sidebar__wordmark min-w-0 font-display text-sm font-bold leading-tight text-ink-900 dark:text-ink-50">
              {t('adminNav.brand')}
              <span className="admin-sidebar__subtitle block text-[11px] font-medium text-ink-500 dark:text-ink-400">{t('adminNav.subtitle')}</span>
            </span>
          )}
        </Link>

        <button
          type="button"
          onClick={onCloseMobile}
          aria-label={t('adminNav.close')}
          className="ml-auto rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 lg:hidden dark:hover:bg-ink-700"
        >
          <X aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>

      <nav aria-label={t('adminNav.navigation')} className="admin-sidebar__nav flex-1 overflow-y-auto px-3 py-4">
        {SECCIONES.map((seccion) => (
          <div key={seccion.titulo} className="admin-sidebar__section mb-5">
            {!collapsed && (
              <p className="admin-sidebar__section-title mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-ink-400">{t(`adminNav.sections.${seccion.titulo}`)}</p>
            )}
            <ul className="space-y-1">
              {seccion.items.map(({ to, label, Icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    onClick={onCloseMobile}
                    title={collapsed ? t(`adminNav.items.${label}`) : undefined}
                    className={({ isActive }) =>
                      cn(
                        'admin-sidebar__link nav-tab-link flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                        collapsed && 'justify-center px-2',
                        isActive
                          ? 'bg-brand-500 text-white'
                          : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-700',
                      )
                    }
                  >
                    <Icon aria-hidden="true" className="h-4.5 w-4.5 shrink-0" />
                    {!collapsed && <span className="truncate">{t(`adminNav.items.${label}`)}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <button
        type="button"
        onClick={onToggleCollapse}
        aria-label={t(collapsed ? 'ui.expandSidebar' : 'ui.collapseSidebar')}
        aria-pressed={collapsed}
        className="admin-sidebar__collapse hidden h-12 items-center justify-center gap-2 border-t border-ink-200 text-xs font-medium text-ink-500 transition hover:bg-ink-100 lg:flex dark:border-ink-700 dark:hover:bg-ink-700"
      >
        <ChevronLeft aria-hidden="true" className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
        {!collapsed && t('adminNav.collapse')}
      </button>
    </>
  );

  return (
    <>
      {/* Escritorio */}
      <aside
        className={cn(
          'admin-sidebar fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-ink-200 bg-white transition-[width] duration-300 lg:flex dark:border-ink-700 dark:bg-ink-800',
          collapsed ? 'w-[72px]' : 'w-64',
        )}
      >
        {content}
      </aside>

      {/* Móvil */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-900/60" onClick={onCloseMobile} aria-hidden="true" />
          <aside className="admin-sidebar admin-sidebar--mobile relative flex h-full w-72 flex-col border-r border-ink-200 bg-white animate-slide-up dark:border-ink-700 dark:bg-ink-800">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}