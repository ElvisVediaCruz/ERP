import apiClient from '@shared/services/apiClient';

export function listPaymentMethods() {
  return apiClient.get('/payment-methods').then((r) => r.data.data);
}
