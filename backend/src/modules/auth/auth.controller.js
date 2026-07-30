const asyncHandler = require('../../shared/utils/asyncHandler');
const service = require('./auth.service');

const login = asyncHandler(async (req, res) => {
  const data = await service.login(req.body);
  res.json({ data });
});

module.exports = { login };
