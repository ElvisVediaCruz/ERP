import apiClient from '@shared/services/apiClient';

export function listPurchases(params) {
  return apiClient.get('/purchases', { params }).then((r) => r.data);
}

export function getPurchase(id) {
  return apiClient.get(`/purchases/${id}`).then((r) => r.data.data);
}

export function createPurchase(payload) {
  return apiClient.post('/purchases', payload).then((r) => r.data.data);
}
