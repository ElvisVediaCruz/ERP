import apiClient from '@shared/services/apiClient';

export function listProducts(params) {
  return apiClient.get('/products', { params }).then((r) => r.data);
}

export function listLowStock() {
  return apiClient.get('/products/low-stock').then((r) => r.data.data);
}

export function searchProducts(search, type) {
  return apiClient.get('/products/search', { params: { search, type } }).then((r) => r.data.data);
}

export function getProduct(id) {
  return apiClient.get(`/products/${id}`).then((r) => r.data.data);
}

export function createProduct(payload) {
  return apiClient.post('/products', payload).then((r) => r.data.data);
}

export function updateProduct(id, payload) {
  return apiClient.put(`/products/${id}`, payload).then((r) => r.data.data);
}

export function deleteProduct(id) {
  return apiClient.delete(`/products/${id}`);
}

export function updateProductStatus(id, status) {
  return apiClient.patch(`/products/${id}/status`, { status });
}

export function reassignProductsCategory(data) {
  return apiClient.patch('/products/reassign-category', data).then((r) => r.data.data);
}
