import api from './api';

export const purchaseService = {
  getHistory: (params) => api.get('/purchases', { params }),
};