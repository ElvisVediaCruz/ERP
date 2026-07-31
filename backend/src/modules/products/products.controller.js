const asyncHandler = require('../../shared/utils/asyncHandler');
const service = require('./products.service');

const list = asyncHandler(async (req, res) => {
  const { rows, meta } = await service.listProducts(req.query);
  res.json({ data: rows, meta });
});

const lowStock = asyncHandler(async (req, res) => {
  const data = await service.listLowStock();
  res.json({ data });
});

const search = asyncHandler(async (req, res) => {
  const data = await service.searchProducts(req.query.search, req.query.type);
  res.json({ data });
});

const getById = asyncHandler(async (req, res) => {
  const data = await service.getProduct(req.params.id);
  res.json({ data });
});

const create = asyncHandler(async (req, res) => {
  const data = await service.createProduct(req.body);
  res.status(201).json({ data });
});

const update = asyncHandler(async (req, res) => {
  const data = await service.updateProduct(req.params.id, req.body);
  res.json({ data });
});

const remove = asyncHandler(async (req, res) => {
  await service.deleteProduct(req.params.id);
  res.status(204).send();
});

const updateStatus = asyncHandler(async (req, res) => {
  await service.updateProductStatus(req.params.id, req.body.status);
  res.status(204).send();
});

const reassignCategory = asyncHandler(async (req, res) => {
  const affected = await service.updateProductsCategory(req.body);
  res.json({ data: { affected } });
});

module.exports = { list, lowStock, search, getById, create, update, remove, updateStatus, reassignCategory };
