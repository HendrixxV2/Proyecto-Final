import { api } from './api';

export const espaciosService = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/espacios${qs ? `?${qs}` : ''}`);
  },
  getById: (id) => api.get(`/espacios/${id}`),
  create: (data) => api.post('/espacios', data),
  update: (id, data) => api.put(`/espacios/${id}`, data),
  remove: (id) => api.delete(`/espacios/${id}`),
};