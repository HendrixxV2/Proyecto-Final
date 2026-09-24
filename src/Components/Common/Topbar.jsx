import { Link, useNavigate } from 'react-router-dom';
import { Bell, ExternalLink, LogOut, Menu, Search, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/Hooks/useAuth';
import { PATHS } from '@/Routes/paths';
import ThemeToggle from '@/Components/UI/ThemeToggle';
import FontSizeControl from '@/Components/UI/FontSizeControl';

export default function Topbar({ onOpenMobile }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(PATHS.home);
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-ink-200 bg-white/90 px-4 backdrop-blur sm:px-6 dark:border-ink-700 dark:bg-ink-800/90">
      <button
        type="button"
        onClick={onOpenMobile}
        aria-label="Abrir menú lateral"
        className="rounded-lg p-2 text-ink-600 hover:bg-ink-100 lg:hidden dark:text-ink-300 dark:hover:bg-ink-700"
      >
        <Menu aria-hidden="true" className="h-5 w-5" />
      </button>

      <div className="relative hidden max-w-sm flex-1 sm:block">
        <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input
          type="search"
          placeholder="Buscar reservas, espacios, usuarios…"
          aria-label="Búsqueda global del panel"
          className="h-10 w-full rounded-xl border border-ink-200 bg-ink-50 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-ink-600 dark:bg-ink-900 dark:text-ink-100"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden xl:block"><FontSizeControl /></div>
        <div className="hidden lg:block"><ThemeToggle compact /></div>

        <button
          type="button"
          aria-label="Notificaciones: 3 nuevas"
          className="relative rounded-lg p-2 text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-700"
        >
          <Bell aria-hidden="true" className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-brand-500 text-[10px] font-bold text-white">3</span>
        </button>

        <Link
          to={PATHS.home}
          className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-600 hover:bg-ink-100 sm:inline-flex dark:text-ink-300 dark:hover:bg-ink-700"
        >
          <ExternalLink aria-hidden="true" className="h-4 w-4" />
          Ver sitio
        </Link>

        <div className="flex items-center gap-2 border-l border-ink-200 pl-2 dark:border-ink-700">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-jade-500 text-sm font-bold text-white">
            {user?.nombre?.charAt(0) ?? 'A'}
          </span>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-ink-800 dark:text-ink-100">{user?.nombre}</p>
            <p className="flex items-center gap-1 text-[11px] text-ink-500 dark:text-ink-400">
              <ShieldCheck aria-hidden="true" className="h-3 w-3" /> Administrador
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Cerrar sesión"
            className="rounded-lg p-2 text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-700"
          >
            <LogOut aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}