const pool = require('../../config/db');
const ApiError = require('../../shared/errors/ApiError');
const repository = require('./suppliers.repository');

async function listSuppliers(query) {
  const status = query.status === undefined ? undefined : query.status === 'true';
  return repository.findAll(pool, { status });
}

async function getSupplier(id) {
  const supplier = await repository.findById(pool, id);
  if (!supplier) throw ApiError.notFound(`Proveedor ${id} no encontrado`);
  return supplier;
}

async function createSupplier(data) {
  return repository.create(pool, data);
}

async function updateSupplier(id, data) {
  await getSupplier(id);
  return repository.update(pool, id, data);
}

async function deleteSupplier(id) {
  await getSupplier(id);
  await repository.softDelete(pool, id);
}

module.exports = { listSuppliers, getSupplier, createSupplier, updateSupplier, deleteSupplier };
