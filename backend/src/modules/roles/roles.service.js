const ApiError = require('../../shared/errors/ApiError');
const repository = require('./roles.repository');
const pool = require('../../config/db');
const env = require('../../config/env');

const ROLES_VALID = ['admin', 'user', 'root'];

async function createRole(data){
    if(data.validate != env.CODE_VERIFICATION || !ROLES_VALID.includes(data.name)){
        throw ApiError.notFound('Access denied');
    }
    const roleExists = await repository.existName(pool, data.name);
    if(roleExists){
        console.log('here', roleExists);
        throw ApiError.badRequest('Role name exists');
    }
    const roleId = await repository.create(pool, data);
    return { id: roleId};
}

module.exports = {
    createRole
}