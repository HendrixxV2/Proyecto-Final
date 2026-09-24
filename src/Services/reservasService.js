import { api } from './api';
import { ESTADOS_RESERVA } from '@/Utils/constants';

export const reservasService = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/reservas${qs ? `?${qs}` : ''}`);
  },

  listByUsuario: (usuarioId) => api.get(`/reservas?usuarioId=${usuarioId}&_sort=fecha&_order=desc`),

  listByEspacioYFecha: (espacioId, fecha) =>
    api.get(`/reservas?espacioId=${espacioId}&fecha=${fecha}`),

  async create(data) {
    const existentes = await api.get(`/reservas?espacioId=${data.espacioId}&fecha=${data.fecha}`);
    const solapada = existentes.some(
      (r) =>
        r.estado !== ESTADOS_RESERVA.RECHAZADA &&
        r.estado !== ESTADOS_RESERVA.CANCELADA &&
        data.horaInicio < r.horaFin &&
        data.horaFin > r.horaInicio,
    );

    if (solapada) {
      const error = new Error('El espacio ya está reservado en ese horario.');
      error.status = 409;
      throw error;
    }

    return api.post('/reservas', {
      ...data,
      estado: ESTADOS_RESERVA.PENDIENTE,
      creadoEn: new Date().toISOString(),
    });
  },

  update: (id, data) => api.patch(`/reservas/${id}`, data),
  aprobar: (id) => api.patch(`/reservas/${id}`, { estado: ESTADOS_RESERVA.APROBADA }),
  rechazar: (id) => api.patch(`/reservas/${id}`, { estado: ESTADOS_RESERVA.RECHAZADA }),
  cancelar: (id) => api.patch(`/reservas/${id}`, { estado: ESTADOS_RESERVA.CANCELADA }),
  remove: (id) => api.delete(`/reservas/${id}`),
};