const pool = require('../../config/db');
const ApiError = require('../../shared/errors/ApiError');
const { parsePagination } = require('../../shared/utils/pagination');
const repository = require('./products.repository');
const categoriesRepository = require('../categories/categories.repository');
const suppliersRepository = require('../suppliers/suppliers.repository');

async function assertReferencesExist({ category_id, supplier_id }) {
  const categoryExists = await categoriesRepository.exists(pool, category_id);
  if (!categoryExists) {
    throw ApiError.badRequest(`La categoría ${category_id} no existe o está inactiva`);
  }
  if (supplier_id !== undefined) {
    const supplierExists = await suppliersRepository.exists(pool, supplier_id);
    if (!supplierExists) {
      throw ApiError.badRequest(`El proveedor ${supplier_id} no existe o está inactivo`);
    }
  }
}

async function listProducts(query) {
  const { category_id, supplier_id, search } = query;
  const status = query.status === undefined ? undefined : query.status === 'true';
  const { page, limit, offset } = parsePagination(query);

  const { rows, total } = await repository.findAll(
    pool,
    { category_id, supplier_id, status, search },
    { limit, offset }
  );

  return { rows, meta: { total, page, limit } };
}

async function listLowStock() {
  return repository.findLowStock(pool);
}

async function getProduct(id) {
  const product = await repository.findById(pool, id);
  if (!product) throw ApiError.notFound(`Producto ${id} no encontrado`);
  return product;
}

async function createProduct(data) {
  await assertReferencesExist(data);
  return repository.create(pool, data);
}

async function updateProduct(id, data) {
  await getProduct(id);
  await assertReferencesExist(data);
  return repository.update(pool, id, data);
}

async function deleteProduct(id) {
  await getProduct(id);
  await repository.softDelete(pool, id);
}

async function updateProductsCategory(data) {
  const entries = Object.entries(data);
  const categoryIds = entries.map(([, categoryId]) => categoryId);
  if (categoryIds.every((value) => value === categoryIds[0])) {
    const productIds = entries.map(([productId]) => Number(productId));
    return repository.updateCategoryMatch(pool, productIds, categoryIds[0]);
  }
  return repository.updateCategoryNoMatching(pool, data);
}

module.exports = {
  listProducts,
  listLowStock,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductsCategory,
};
