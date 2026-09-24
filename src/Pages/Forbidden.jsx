// Forbidden.jsx
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import Button from '@/Components/UI/Button';
import { PATHS } from '@/Routes/paths';

export default function Forbidden() {
  return (
    <main className="grid min-h-[70vh] place-items-center px-6">
      <div className="text-center">
        <ShieldAlert aria-hidden="true" className="mx-auto h-12 w-12 text-red-600" />
        <h1 className="mt-6 font-display text-3xl font-bold text-ink-900 dark:text-ink-50">Acceso restringido</h1>
        <p className="mt-2 max-w-md text-sm text-ink-600 dark:text-ink-300">
          Tu cuenta no tiene los permisos necesarios para ver esta sección. Si crees que es un error, contacta a la
          administración del centro.
        </p>
        <Button as={Link} to={PATHS.home} className="mt-6">Volver al inicio</Button>
      </div>
    </main>
  );
}