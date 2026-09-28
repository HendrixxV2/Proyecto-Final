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

  listDisponibles: () => api.get(`/boletos?estado=${ESTADOS_BOLETO.DISPONIBLE}`),

  listDisponiblesPorEvento: (eventoId) =>
    api.get(`/boletos?eventoId=${eventoId}&estado=${ESTADOS_BOLETO.DISPONIBLE}`),

  async reservar(eventoId, usuarioId, precio, seleccion = 1) {
    const esSeleccionDeButacas = Array.isArray(seleccion);
    const cantidadSolicitada = esSeleccionDeButacas ? seleccion.length : Number(seleccion);
    if (!Number.isInteger(cantidadSolicitada) || cantidadSolicitada < 1) {
      throw new Error('La cantidad de boletos debe ser al menos 1.');
    }

    const disponibles = await boletosService.listDisponiblesPorEvento(eventoId);

    if (disponibles.length < cantidadSolicitada) {
      const error = new Error(
        disponibles.length === 0
          ? 'No hay boletos disponibles para este evento.'
          : `Solo quedan ${disponibles.length} boletos disponibles.`,
      );
      error.status = 409;
      throw error;
    }

    let boletosAReservar = disponibles.slice(0, cantidadSolicitada);
    if (esSeleccionDeButacas) {
      const idsSeleccionados = seleccion.map(({ id }) => String(id));
      if (new Set(idsSeleccionados).size !== idsSeleccionados.length) {
        throw new Error('No puedes seleccionar la misma butaca más de una vez.');
      }

      boletosAReservar = idsSeleccionados.map((id) =>
        disponibles.find((boleto) => String(boleto.id) === id),
      );
      if (boletosAReservar.some((boleto) => !boleto)) {
        const error = new Error('Una o más butacas ya no están disponibles. Actualiza la selección.');
        error.status = 409;
        throw error;
      }
    }

    const reservados = [];
    for (const boleto of boletosAReservar) {
      const butaca = esSeleccionDeButacas
        ? seleccion.find(({ id }) => String(id) === String(boleto.id))?.asiento
        : undefined;
      reservados.push(await api.patch(`/boletos/${boleto.id}`, {
        estado: ESTADOS_BOLETO.RESERVADO,
        usuarioId,
        ...(butaca ? { asiento: butaca } : {}),
      }));
    }
    return reservados;
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