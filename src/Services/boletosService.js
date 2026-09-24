import { api } from './api';
import { ESTADOS_BOLETO } from '@/Utils/constants';

const generarCodigo = (eventoId) =>
  `ORO-${String(eventoId).padStart(3, '0')}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

export const boletosService = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/boletos${qs ? `?${qs}` : ''}`);
  },

  listByUsuario: (usuarioId) => api.get(`/boletos?usuarioId=${usuarioId}`),

  listDisponiblesPorEvento: (eventoId) =>
    api.get(`/boletos?eventoId=${eventoId}&estado=${ESTADOS_BOLETO.DISPONIBLE}`),

  async reservar(eventoId, usuarioId, precio) {
    const disponibles = await boletosService.listDisponiblesPorEvento(eventoId);

    if (disponibles.length === 0) {
      const error = new Error('No hay boletos disponibles para este evento.');
      error.status = 409;
      throw error;
    }

    return api.patch(`/boletos/${disponibles[0].id}`, {
      estado: ESTADOS_BOLETO.RESERVADO,
      usuarioId,
    });
  },

  async emitir(eventoId, precio = 0) {
    return api.post('/boletos', {
      eventoId,
      codigo: generarCodigo(eventoId),
      precio,
      estado: ESTADOS_BOLETO.DISPONIBLE,
      usuarioId: null,
    });
  },

  update: (id, data) => api.patch(`/boletos/${id}`, data),
  remove: (id) => api.delete(`/boletos/${id}`),
};