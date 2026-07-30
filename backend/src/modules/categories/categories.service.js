const pool = require('../../config/db');
const ApiError = require('../../shared/errors/ApiError');
const { parsePagination } = require('../../shared/utils/pagination');
const repository = require('./categories.repository');
const { findByCategorie } = require('../products/products.repository')

async function listCategories(query) {
  const status = query.status === undefined ? undefined : query.status === 'true';
  const { page, limit, offset } = parsePagination(query);
  const { rows, total } = await repository.findAll(pool, { status, limit, offset });
  return { rows, meta: { total, page, limit } };
}

async function getCategory(id) {
  const category = await repository.findById(pool, id);
  if (!category) throw ApiError.notFound(`Categoría ${id} no encontrada`);
  return category;
}


async function createCategory(data) {
  //buscar si ya existe la categoria con el mismo nombre
  const existingCategories = await repository.findByName(pool, data.name);
  if(existingCategories.length > 0){
    throw ApiError.conflict(`la categoria ${data.name} ya existe`);
  }
  return repository.create(pool, data);
}

async function updateCategory(id, data) {
  await getCategory(id);
  return repository.update(pool, id, data);
}

async function updateCategoryStatus(id, status) {
  await getCategory(id);
  await repository.updateStatus(pool, id, !status);
}

async function deleteCategory(id) {
  await getCategory(id);
  const [categories, products] = await Promise.all([
    repository.findOtherCategories(pool, id),
    findByCategorie(pool, id)
  ]);
  if(products.length > 0){
    return {
      message: `la categoria tiene productos asociados`,
      categories: categories,
      products: products
    }
  }
  try {
    return await repository.remove(pool, id);
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      throw ApiError.conflict('La categoría tiene productos asociados');
    }
    throw err;
  }
}

module.exports = {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  updateCategoryStatus,
  deleteCategory 
};
