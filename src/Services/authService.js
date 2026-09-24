import { api } from './api';
import { SESSION_KEY, ROLES } from '@/Utils/constants';

const buildToken = (id) => `caco.${btoa(`${id}:${Date.now()}`)}`;

const toSession = (user) => ({
  id: user.id,
  nombre: user.nombre,
  email: user.email,
  rol: user.rol,
  avatar: user.avatar ?? null,
  token: buildToken(user.id),
  emitidoEn: new Date().toISOString(),
});

export const authService = {
  async login({ email, password }) {
    const usuarios = await api.get(`/usuarios?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    const usuario = usuarios[0];

    if (!usuario || usuario.password !== password) {
      const error = new Error('Correo o contraseña incorrectos.');
      error.status = 401;
      throw error;
    }

    const session = toSession(usuario);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  },

  async register({ nombre, email, password }) {
    const normalized = email.trim().toLowerCase();
    const existentes = await api.get(`/usuarios?email=${encodeURIComponent(normalized)}`);

    if (existentes.length > 0) {
      const error = new Error('Ya existe una cuenta con este correo.');
      error.status = 409;
      throw error;
    }

    const creado = await api.post('/usuarios', {
      nombre: nombre.trim(),
      email: normalized,
      password,
      rol: ROLES.USUARIO,
      avatar: null,
      creadoEn: new Date().toISOString(),
    });

    const session = toSession(creado);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  },

  logout() {
    localStorage.removeItem(SESSION_KEY);
  },

  getSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  hasRole(session, roles = []) {
    if (!session) return false;
    if (!roles.length) return true;
    return roles.includes(session.rol);
  },
};