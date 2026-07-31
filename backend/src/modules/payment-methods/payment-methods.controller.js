const asyncHandler = require('../../shared/utils/asyncHandler');
const service = require('./payment-methods.service');

const list = asyncHandler(async (req, res) => {
  const data = await service.listPaymentMethods(req.query);
  res.json({ data });
});

const getById = asyncHandler(async (req, res) => {
  const data = await service.getPaymentMethod(req.params.id);
  res.json({ data });
});

const create = asyncHandler(async (req, res) => {
  const data = await service.createPaymentMethod(req.body);
  res.status(201).json({ data });
});

const update = asyncHandler(async (req, res) => {
  const data = await service.updatePaymentMethod(req.params.id, req.body);
  res.json({ data });
});

const remove = asyncHandler(async (req, res) => {
  await service.deletePaymentMethod(req.params.id);
  res.status(204).send();
});

const updateStatus = asyncHandler(async (req, res) => {
  await service.updatePaymentMethodStatus(req.params.id, req.body.status);
  res.status(204).send();
});

module.exports = { list, getById, create, update, remove, updateStatus };
