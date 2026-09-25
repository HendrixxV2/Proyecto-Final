import { playEditorErrorSound } from './errorSound';

export const isRequired = (v) => v !== undefined && v !== null && String(v).trim() !== '';

export const isEmail = (v) => /^[^\s@]+@[^\s@]+$/.test(String(v).trim());

export const minLength = (v, n) => String(v ?? '').trim().length >= n;

export const isStrongEnough = (v) => String(v ?? '').length >= 6;

export const isFutureDate = (v) => {
  if (!v) return false;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return new Date(`${v}T00:00:00`) >= hoy;
};

export const horaValida = (v) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(String(v));

export const rangoHorarioValido = (inicio, fin) => horaValida(inicio) && horaValida(fin) && inicio < fin;

export function validateForm(values, rules) {
  const errors = {};
  Object.entries(rules).forEach(([field, fieldRules]) => {
    for (const rule of fieldRules) {
      const message = rule(values[field], values);
      if (message) {
        errors[field] = message;
        break;
      }
    }
  });
  if (Object.keys(errors).length > 0) playEditorErrorSound();
  return { errors, isValid: Object.keys(errors).length === 0 };
}

export const required = (msg = 'Este campo es obligatorio') => (v) => (!isRequired(v) ? msg : null);
export const email = (msg = 'Correo electrónico inválido') => (v) => (!isEmail(v) ? msg : null);
export const min = (n, msg) => (v) => (!minLength(v, n) ? msg ?? `Mínimo ${n} caracteres` : null);