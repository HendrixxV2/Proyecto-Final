import { format, parseISO, isToday, isTomorrow, formatDistanceToNowStrict } from 'date-fns';
import { es } from 'date-fns/locale';

export const toDate = (value) => (value instanceof Date ? value : parseISO(String(value)));

export const formatFecha = (value, pattern = "d 'de' MMMM 'de' yyyy") =>
  format(toDate(value), pattern, { locale: es });

export const formatFechaCorta = (value) => format(toDate(value), 'dd/MM/yyyy', { locale: es });

export const formatHora = (hhmm) => {
  const [h, m] = String(hhmm).split(':').map(Number);
  const suffix = h >= 12 ? 'p. m.' : 'a. m.';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
};

export const formatRangoHoras = (inicio, fin) => `${formatHora(inicio)} – ${formatHora(fin)}`;

export const etiquetaDia = (value) => {
  const d = toDate(value);
  if (isToday(d)) return 'Hoy';
  if (isTomorrow(d)) return 'Mañana';
  return format(d, 'EEE d MMM', { locale: es });
};

export const formatColones = (valor) =>
  new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    maximumFractionDigits: 0,
  }).format(Number(valor) || 0);

export const hace = (value) => formatDistanceToNowStrict(toDate(value), { addSuffix: true, locale: es });