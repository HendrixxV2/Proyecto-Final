import { Link, Outlet } from 'react-router-dom';
import { Landmark } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-brand-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,white,transparent_45%),radial-gradient(circle_at_80%_70%,#E9A03B,transparent_40%)]"
        />
        <Link to="/" className="relative z-10 flex items-center gap-3 text-lg font-semibold">
          <Landmark aria-hidden="true" className="h-7 w-7" />
          <span className="font-display">CACO · Luis Ferrero Acosta</span>
        </Link>

        <blockquote className="relative z-10 max-w-md">
          <p className="font-display text-3xl leading-snug">
            “La cultura es el riel por donde viaja la memoria de un pueblo.”
          </p>
          <footer className="mt-4 text-sm text-brand-100">Centro Cultural Orotinense</footer>
        </blockquote>

        <p className="relative z-10 text-xs text-brand-200">
          Orotina, Alajuela · Antiguo complejo del Ferrocarril al Pacífico
        </p>
      </aside>

      <main id="contenido-principal" className="flex items-center justify-center bg-ink-50 px-6 py-12 dark:bg-ink-900">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
    </div>
  );
}