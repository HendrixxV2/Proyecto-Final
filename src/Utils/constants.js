export const ROLES = {
  ADMIN: 'admin',
  USUARIO: 'usuario_regular',
};

export const ROL_LABEL = {
  [ROLES.ADMIN]: 'Administrador',
  [ROLES.USUARIO]: 'Usuario regular',
};

export const ESTADOS_RESERVA = {
  PENDIENTE: 'pendiente',
  APROBADA: 'aprobada',
  RECHAZADA: 'rechazada',
  CANCELADA: 'cancelada',
};

export const ESTADOS_BOLETO = {
  DISPONIBLE: 'disponible',
  RESERVADO: 'reservado',
  PAGADO: 'pagado',
  USADO: 'usado',
  CANCELADO: 'cancelado',
};

export const BADGE_TONE_BY_ESTADO = {
  pendiente: 'warning',
  aprobada: 'success',
  rechazada: 'danger',
  cancelada: 'neutral',
  disponible: 'info',
  reservado: 'warning',
  pagado: 'success',
  usado: 'neutral',
};

export const CATEGORIAS_EVENTO = ['teatro', 'baile', 'canto', 'exposicion', 'taller', 'feria', 'concierto'];

export const FONT_SCALES = [
  { id: 'sm', label: 'A', value: 0.875, title: 'Texto pequeño' },
  { id: 'md', label: 'A', value: 1, title: 'Texto normal' },
  { id: 'lg', label: 'A', value: 1.125, title: 'Texto grande' },
  { id: 'xl', label: 'A', value: 1.25, title: 'Texto muy grande' },
];

export const SESSION_KEY = 'caco.session';
export const THEME_KEY = 'caco.theme';
export const A11Y_KEY = 'caco.a11y';
export const LANGUAGE_KEY = 'caco.language';
export const SPACING_UNIT = 4; // sistema base 4px