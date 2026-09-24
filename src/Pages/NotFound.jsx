// NotFound.jsx
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import Button from '@/Components/UI/Button';
import { PATHS } from '@/Routes/paths';

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-ink-50 px-6 dark:bg-ink-900">
      <div className="text-center">
        <Compass aria-hidden="true" className="mx-auto h-12 w-12 text-brand-500" />
        <h1 className="mt-6 font-display text-4xl font-bold text-ink-900 dark:text-ink-50">404</h1>
        <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">
          La página que buscas no existe o fue movida.
        </p>
        <Button as={Link} to={PATHS.home} className="mt-6">Volver al inicio</Button>
      </div>
    </main>
  );
}