import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/Hooks/useAuth';
import Forbidden from '@/Pages/Forbidden';
import { PATHS } from './paths';

export default function RoleRoute({ roles = [], fallback = null }) {
  const { user } = useAuth();

  if (!user) return <Navigate to={PATHS.login} replace />;

  const autorizado = roles.length === 0 || roles.includes(user.rol);
  if (!autorizado) return fallback ?? <Forbidden />;

  return <Outlet />;
}