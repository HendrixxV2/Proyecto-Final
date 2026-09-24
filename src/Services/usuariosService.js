import { api } from './api';

export const usuariosService = {
  list: () => api.get('/usuarios'),
  getById: (id) => api.get(`/usuarios/${id}`),
  create: (data) => api.post('/usuarios', data),
  update: (id, data) => api.put(`/usuarios/${id}`, data),
  remove: (id) => api.delete(`/usuarios/${id}`),
};