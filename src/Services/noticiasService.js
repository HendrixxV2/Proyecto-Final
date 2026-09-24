import { api } from './api';

export const noticiasService = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/noticias${qs ? `?${qs}` : ''}`);
  },
  latest: (n = 3) => api.get(`/noticias?_sort=fecha&_order=desc&_limit=${n}`),
  getById: (id) => api.get(`/noticias/${id}`),
  create: (data) => api.post('/noticias', data),
  update: (id, data) => api.put(`/noticias/${id}`, data),
  remove: (id) => api.delete(`/noticias/${id}`),
};