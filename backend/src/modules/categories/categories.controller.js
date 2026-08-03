const asyncHandler = require('../../shared/utils/asyncHandler');
const service = require('./categories.service');

const list = asyncHandler(async (req, res) => {
  const { rows, meta } = await service.listCategories(req.query);
  res.json({ data: rows, meta });
});

const search = asyncHandler(async (req, res) => {
  const categories = await service.searchCategories(req.query.name);
  res.json({data: categories});
})

const getById = asyncHandler(async (req, res) => {
  const data = await service.getCategory(req.params.id);
  res.json({ data });
});

const create = asyncHandler(async (req, res) => {
  const data = await service.createCategory(req.body);
  res.status(201).json({ data });
});

const update = asyncHandler(async (req, res) => {
  const data = await service.updateCategory(req.params.id, req.body);
  res.json({ data });
});

const remove = asyncHandler(async (req, res) => {
  const result = await service.deleteCategory(req.params.id);
  if (result && Array.isArray(result.products)) {
    return res.status(200).json({ data: result });
  }
  res.status(204).send();
});

const updateStatus = asyncHandler(async (req, res) => {
  await service.updateCategoryStatus(req.params.id, req.body.status);
  res.status(204).send();
});

module.exports = { list, search, getById, create, update, remove, updateStatus };
