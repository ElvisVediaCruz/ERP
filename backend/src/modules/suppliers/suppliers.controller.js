const asyncHandler = require('../../shared/utils/asyncHandler');
const service = require('./suppliers.service');

const list = asyncHandler(async (req, res) => {
  const data = await service.listSuppliers(req.query);
  res.json({ data });
});

const getById = asyncHandler(async (req, res) => {
  const data = await service.getSupplier(req.params.id);
  res.json({ data });
});

const create = asyncHandler(async (req, res) => {
  const data = await service.createSupplier(req.body);
  res.status(201).json({ data });
});

const update = asyncHandler(async (req, res) => {
  const data = await service.updateSupplier(req.params.id, req.body);
  res.json({ data });
});

const remove = asyncHandler(async (req, res) => {
  await service.deleteSupplier(req.params.id);
  res.status(204).send();
});

module.exports = { list, getById, create, update, remove };
