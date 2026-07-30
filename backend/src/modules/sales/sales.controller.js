const asyncHandler = require('../../shared/utils/asyncHandler');
const service = require('./sales.service');

const create = asyncHandler(async (req, res) => {
  const data = await service.createSale({ ...req.body, user_id: req.user.id });
  res.status(201).json({ data });
});

const list = asyncHandler(async (req, res) => {
  const { rows, meta } = await service.listSales(req.query);
  res.json({ data: rows, meta });
});

const getById = asyncHandler(async (req, res) => {
  const data = await service.getSale(req.params.id);
  res.json({ data });
});

module.exports = { create, list, getById };
