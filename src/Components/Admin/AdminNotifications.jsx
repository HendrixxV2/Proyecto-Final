import { useEffect, useMemo, useState } from 'react';
import { Bell, CheckCheck, ChevronRight, Clock3, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ADMIN_NOTIFICATION_ROUTES } from '@/Routes/paths';

const storageKey = 'admin-notifications-read';

const notificationIcons = {
  nueva_reserva: Sparkles,
  usuario_nuevo: Sparkles,
  reporte_activo: Bell,
};

const readFromStorage = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

export const buildAdminNotifications = ({ pendingReservations = 0 } = {}) => {
  const items = [];

  if (pendingReservations > 0) {
    items.push({
      id: 'reserva-pendiente',
      type: 'nueva_reserva',
      title: pendingReservations === 1 ? 'Nueva reserva en Sala de Danza' : `${pendingReservations} nuevas reservas pendientes`,
      description: pendingReservations === 1
        ? 'Revisa la solicitud antes de aprobarla.'
        : 'Hay varias solicitudes esperando revisión.',
      to: ADMIN_NOTIFICATION_ROUTES.nueva_reserva,
      time: 'Hace unos minutos',
      read: false,
    });
  }

  items.push({
    id: 'usuarios-pendientes',
    type: 'usuario_nuevo',
    title: 'Usuarios por revisar',
    description: 'Revisa usuarios con reservas y solicitudes pendientes.',
    to: ADMIN_NOTIFICATION_ROUTES.usuario_nuevo,
    time: 'Hace 20 minutos',
    read: false,
  });

  items.push({
    id: 'reporte-semanal',
    type: 'reporte_activo',
    title: 'Reporte semanal disponible',
    description: 'Consulta el resumen actualizado de actividad del centro.',
    to: ADMIN_NOTIFICATION_ROUTES.reporte_activo,
    time: 'Hace 1 hora',
    read: false,
  });

  return items.slice(0, 3);
};

export default function AdminNotifications({ notifications = [] }) {
  const [items, setItems] = useState(() => {
    const saved = readFromStorage();
    const base = Array.isArray(notifications) ? notifications : [];
    return base.map((notification) => ({
      ...notification,
      read: Boolean(notification.read) || saved.includes(notification.id),
    }));
  });
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = readFromStorage();
    setItems((current) => (Array.isArray(notifications) ? notifications : []).map((notification) => ({
      ...notification,
      read: Boolean(notification.read) || saved.includes(notification.id) || current.find((item) => item.id === notification.id)?.read,
    })));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items.filter((item) => item.read).map((item) => item.id)));
  }, [items]);

  const unreadCount = useMemo(
    () => items.filter((notification) => !notification.read).length,
    [items],
  );

  const markAsRead = (notificationId) => {
    setItems((current) => current.map((item) => (
      item.id === notificationId ? { ...item, read: true } : item
    )));
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    setOpen(false);
    navigate(notification.to);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={unreadCount ? `Notificaciones: ${unreadCount} nuevas` : 'Notificaciones'}
        className="relative rounded-lg p-2 text-ink-600 transition hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-700"
      >
        <Bell aria-hidden="true" className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-brand-500 text-[10px] font-bold text-white">
            {Math.min(unreadCount, 9)}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-80 overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-xl dark:border-ink-700 dark:bg-ink-900">
          <div className="flex items-center justify-between border-b border-ink-200 px-4 py-3 dark:border-ink-700">
            <div>
              <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">Notificaciones</p>
              <p className="text-[11px] text-ink-500 dark:text-ink-400">{unreadCount} sin leer</p>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-5 text-sm text-ink-500 dark:text-ink-400">No hay notificaciones nuevas.</div>
            ) : (
              items.map((notification) => {
                const Icon = notificationIcons[notification.type] ?? Bell;

                return (
                  <div
                    key={notification.id}
                    className="flex items-start gap-3 border-b border-ink-100 px-4 py-3 last:border-0 dark:border-ink-800"
                  >
                    <button
                      type="button"
                      onClick={() => handleNotificationClick(notification)}
                      aria-label={`Abrir notificación: ${notification.title}`}
                      className="flex min-w-0 flex-1 items-start gap-3 text-left transition hover:bg-ink-50 dark:hover:bg-ink-800/80"
                    >
                      <span className="mt-0.5 grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-200">
                        <Icon aria-hidden="true" className="h-4 w-4" />
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-ink-800 dark:text-ink-100">{notification.title}</p>
                        <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">{notification.description}</p>
                        <span className="mt-2 inline-flex items-center gap-1 text-[11px] text-ink-400 dark:text-ink-500">
                          <Clock3 aria-hidden="true" className="h-3 w-3" />
                          {notification.time}
                        </span>
                      </div>

                      <ChevronRight aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-ink-400 dark:text-ink-500" />
                    </button>

                    <button
                      type="button"
                      onClick={() => markAsRead(notification.id)}
                      aria-label={notification.read ? 'Notificación leída' : 'Marcar como leída'}
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-ink-200 px-2 py-1 text-[10px] font-medium text-ink-600 transition hover:bg-ink-100 dark:border-ink-700 dark:text-ink-300 dark:hover:bg-ink-700"
                    >
                      <CheckCheck aria-hidden="true" className="h-3.5 w-3.5" />
                      {notification.read ? 'Leída' : 'Leído'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
