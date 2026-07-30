const asyncHandler = require('../../shared/utils/asyncHandler');
const service = require('./users.service');

const list = asyncHandler(async (req, res) => {
  const data = await service.listUsers();
  res.json({ data });
});

const getById = asyncHandler(async (req, res) => {
  const data = await service.getUser(req.params.id);
  res.json({ data });
});

const create = asyncHandler(async (req, res) => {
  const data = await service.createUser(req.body);
  console.log('data', data);
  res.status(201).json({ data });
});

const update = asyncHandler(async (req, res) => {
  const data = await service.updateUser(req.params.id, req.body);
  res.json({ data });
});

const changePassword = asyncHandler(async (req, res) => {
  await service.updateUserPassword(req.params.id, req.body);
  res.status(204).send();
});

const remove = asyncHandler(async (req, res) => {
  await service.deleteUser(req.params.id);
  res.status(204).send();
});

module.exports = { list, getById, create, update, changePassword, remove };
