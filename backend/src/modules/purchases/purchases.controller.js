const asyncHandler = require('../../shared/utils/asyncHandler');
const service = require('./purchases.service');

const create = asyncHandler(async (req, res) => {
  const data = await service.createPurchase({ ...req.body, user_id: req.user.id });
  res.status(201).json({ data });
});

const list = asyncHandler(async (req, res) => {
  const { rows, meta } = await service.listPurchases(req.query);
  res.json({ data: rows, meta });
});

const getById = asyncHandler(async (req, res) => {
  const data = await service.getPurchase(req.params.id);
  res.json({ data });
});

module.exports = { create, list, getById };
