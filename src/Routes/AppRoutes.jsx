import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import PublicLayout from '@/Layouts/PublicLayout';
import AdminLayout from '@/Layouts/AdminLayout';
import AuthLayout from '@/Layouts/AuthLayout';
import PrivateRoute from './PrivateRoute';
import RoleRoute from './RoleRoute';
import { PATHS } from './paths';
import { ROLES } from '@/Utils/constants';
import PageLoader from '@/Components/common/PageLoader';
import NotFound from '@/Pages/NotFound';

const Inicio = lazy(() => import('@/Pages/public/Inicio'));
const Calendario = lazy(() => import('@/Pages/public/Calendario'));
const Espacios = lazy(() => import('@/Pages/public/Espacios'));
const EspacioDetalle = lazy(() => import('@/Pages/public/EspacioDetalle'));
const Reservas = lazy(() => import('@/Pages/public/Reservas'));
const MisReservas = lazy(() => import('@/Pages/public/MisReservas'));
const Boletos = lazy(() => import('@/Pages/public/Boletos'));
const Historia = lazy(() => import('@/Pages/public/Historia'));
const Galeria = lazy(() => import('@/Pages/public/Galeria'));
const Artes = lazy(() => import('@/Pages/public/Artes'));
const Noticias = lazy(() => import('@/Pages/public/Noticias'));
const NoticiaDetalle = lazy(() => import('@/Pages/public/NoticiaDetalle'));

const Login = lazy(() => import('@/Pages/auth/Login'));
const Register = lazy(() => import('@/Pages/auth/Register'));

const DashboardAdmin = lazy(() => import('@/Pages/admin/DashboardAdmin'));
const EspaciosAdmin = lazy(() => import('@/Pages/admin/EspaciosAdmin'));
const ReservasAdmin = lazy(() => import('@/Pages/admin/ReservasAdmin'));
const DisponibilidadAdmin = lazy(() => import('@/Pages/admin/DisponibilidadAdmin'));
const EventosAdmin = lazy(() => import('@/Pages/admin/EventosAdmin'));
const BoletosAdmin = lazy(() => import('@/Pages/admin/BoletosAdmin'));
const UsuariosAdmin = lazy(() => import('@/Pages/admin/UsuariosAdmin'));
const ContenidoAdmin = lazy(() => import('@/Pages/admin/ContenidoAdmin'));
const ReportesAdmin = lazy(() => import('@/Pages/admin/ReportesAdmin'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ----------------------------- PÚBLICO ----------------------------- */}
        <Route element={<PublicLayout />}>
          <Route path={PATHS.home} element={<Inicio />} />
          <Route path={PATHS.calendario} element={<Calendario />} />
          <Route path={PATHS.espacios} element={<Espacios />} />
          <Route path={PATHS.espacioDetalle()} element={<EspacioDetalle />} />
          <Route path={PATHS.reservas} element={<Reservas />} />
          <Route path={PATHS.boletos} element={<Boletos />} />
          <Route path={PATHS.historia} element={<Historia />} />
          <Route path={PATHS.galeria} element={<Galeria />} />
          <Route path={PATHS.artes} element={<Artes />} />
          <Route path={PATHS.noticias} element={<Noticias />} />
          <Route path={PATHS.noticiaDetalle()} element={<NoticiaDetalle />} />
        </Route>

        {/* ------------------------- PRIVADO (usuario) ----------------------- */}
        <Route element={<PrivateRoute />}>
          <Route element={<PublicLayout />}>
            <Route path={PATHS.misReservas} element={<MisReservas />} />
          </Route>
        </Route>

        {/* ------------------------------ AUTH ------------------------------ */}
        <Route element={<AuthLayout />}>
          <Route path={PATHS.login} element={<Login />} />
          <Route path={PATHS.registro} element={<Register />} />
        </Route>

        {/* ------------------------- PRIVADO (admin) ------------------------- */}
        <Route element={<PrivateRoute />}>
          <Route element={<RoleRoute roles={[ROLES.ADMIN]} />}>
            <Route path={PATHS.admin.root} element={<AdminLayout />}>
              <Route index element={<Navigate to={PATHS.admin.dashboard} replace />} />
              <Route path="dashboard" element={<DashboardAdmin />} />
              <Route path="espacios" element={<EspaciosAdmin />} />
              <Route path="reservas" element={<ReservasAdmin />} />
              <Route path="disponibilidad" element={<DisponibilidadAdmin />} />
              <Route path="eventos" element={<EventosAdmin />} />
              <Route path="boletos" element={<BoletosAdmin />} />
              <Route path="usuarios" element={<UsuariosAdmin />} />
              <Route path="contenido" element={<ContenidoAdmin />} />
              <Route path="reportes" element={<ReportesAdmin />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}