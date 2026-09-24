import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/Hooks/useAuth';
import Spinner from '@/Components/UI/Spinner';
import { PATHS } from './paths';

export default function PrivateRoute({ redirectTo = PATHS.login }) {
  const { isAuthenticated, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Spinner label="Verificando sesión…" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  return <Outlet />;
}