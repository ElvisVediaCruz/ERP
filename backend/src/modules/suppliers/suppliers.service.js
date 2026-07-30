const pool = require('../../config/db');
const ApiError = require('../../shared/errors/ApiError');
const { parsePagination } = require('../../shared/utils/pagination');
const repository = require('./suppliers.repository');

async function listSuppliers(query) {
  const status = query.status === undefined ? undefined : query.status === 'true';
  const { page, limit, offset } = parsePagination(query);
  const { rows, total } = await repository.findAll(pool, { status, limit, offset });
  return { rows, meta: { total, page, limit } };
}

async function getSupplier(id) {
  const supplier = await repository.findById(pool, id);
  if (!supplier) throw ApiError.notFound(`Proveedor ${id} no encontrado`);
  return supplier;
}

async function createSupplier(data) {
  const existingSuppliers = await repository.findByName(pool, data.contact_name);
  console.log(existingSuppliers)
  if(existingSuppliers.length > 0) throw ApiError.conflict('El proveedor ya existe');
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
