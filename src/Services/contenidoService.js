import { api } from './api';

export const contenidoService = {
  list: () => api.get('/contenido?_sort=orden'),
  bySeccion: (seccion) => api.get(`/contenido?seccion=${seccion}&_sort=orden`),
  create: (data) => api.post('/contenido', data),
  update: (id, data) => api.put(`/contenido/${id}`, data),
  remove: (id) => api.delete(`/contenido/${id}`),
};