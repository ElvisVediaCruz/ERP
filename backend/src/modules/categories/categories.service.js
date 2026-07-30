const pool = require('../../config/db');
const ApiError = require('../../shared/errors/ApiError');
const repository = require('./categories.repository');
const { findByCategorie } = require('../products/products.repository')

async function listCategories(query) {
  const status = query.status === undefined ? undefined : query.status === 'true';
  return repository.findAll(pool, { status });
}

async function getCategory(id) {
  const category = await repository.findById(pool, id);
  if (!category) throw ApiError.notFound(`Categoría ${id} no encontrada`);
  return category;
}


async function createCategory(data) {
  return repository.create(pool, data);
}

async function updateCategory(id, data) {
  await getCategory(id);
  return repository.update(pool, id, data);
}

async function updateStatusCategory(id) {
  await getCategory(id);
  await repository.softDelete(pool, id);
}

async function deleteCategory(id){
  const [categories, products] = await Promise.all([
    repository.findCategories(pool, id),
    findByCategorie(pool, id)
  ]);
  if(products.length > 0){
    return {
      message: `la categoria tiene productos asociados`,
      categories: categories,
      products: products
    }
  }
  return repository.categorieDelete(pool, id);
}

module.exports = { 
  listCategories, 
  getCategory, 
  createCategory, 
  updateCategory,
  deleteCategory };
