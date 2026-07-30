const pool = require('../../config/db');
const ApiError = require('../../shared/errors/ApiError');
const repository = require('./payment-methods.repository');

async function listPaymentMethods() {
  return repository.findAll(pool);
}

async function getPaymentMethod(id) {
  const paymentMethod = await repository.findById(pool, id);
  if (!paymentMethod) throw ApiError.notFound(`Método de pago ${id} no encontrado`);
  return paymentMethod;
}

async function createPaymentMethod(data) {
  return repository.create(pool, data);
}

async function updatePaymentMethod(id, data) {
  await getPaymentMethod(id);
  return repository.update(pool, id, data);
}

async function deletePaymentMethod(id) {
  await getPaymentMethod(id);
  await repository.softDelete(pool, id);
}

module.exports = {
  listPaymentMethods,
  getPaymentMethod,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
};
