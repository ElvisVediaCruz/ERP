import apiClient from '@shared/services/apiClient';

export function listPaymentMethods(params) {
  return apiClient.get('/payment-methods', { params }).then((r) => r.data.data);
}

export function getPaymentMethod(id) {
  return apiClient.get(`/payment-methods/${id}`).then((r) => r.data.data);
}

export function createPaymentMethod(payload) {
  return apiClient.post('/payment-methods', payload).then((r) => r.data.data);
}

export function updatePaymentMethod(id, payload) {
  return apiClient.put(`/payment-methods/${id}`, payload).then((r) => r.data.data);
}

export function updatePaymentMethodStatus(id, status) {
  return apiClient.patch(`/payment-methods/${id}/status`, { status });
}
