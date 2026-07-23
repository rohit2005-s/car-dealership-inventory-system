import api from './api';

// TODO (Phase 6): wire these into React Query/useEffect calls in pages.
export const vehicleService = {
  getAll: (params) => api.get('/vehicles', { params }),
  search: (params) => api.get('/vehicles/search', { params }),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  remove: (id) => api.delete(`/vehicles/${id}`),
  purchase: (id) => api.post(`/vehicles/${id}/purchase`),
  restock: (id, amount) => api.post(`/vehicles/${id}/restock`, { amount }),
};
