import { api } from './api';

export const eventosService = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/eventos${qs ? `?${qs}` : ''}`);
  },
  listPublicados: () => api.get('/eventos?publicado=true'),
  getById: (id) => api.get(`/eventos/${id}`),
  create: (data) => api.post('/eventos', data),
  update: (id, data) => api.put(`/eventos/${id}`, data),
  remove: (id) => api.delete(`/eventos/${id}`),
};