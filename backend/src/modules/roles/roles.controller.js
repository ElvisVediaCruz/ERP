const asyncHandler = require('../../shared/utils/asyncHandler');
const service = require('./roles.service');

const create = asyncHandler(async (req, res) => {
    const data = await service.createRole(req.body);
    res.status(201).json(data);
});

module.exports = {
    create
}