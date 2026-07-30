const bcrypt = require('bcryptjs');
const pool = require('../../config/db');
const env = require('../../config/env');
const ApiError = require('../../shared/errors/ApiError');
const repository = require('./users.repository');
const rolesRepository = require('../roles/roles.repository');

const SALT_ROUNDS = 10;

async function assertRoleExists(role_id) {
  const roleExists = await rolesRepository.exists(pool, role_id);
  console.log('roleExists', roleExists);
  if (!roleExists) {
    throw ApiError.badRequest(`El rol ${role_id} no existe`);
  }
}

async function listUsers() {
  return repository.findAll(pool);
}

async function getUser(id) {
  const user = await repository.findById(pool, id);
  if (!user) throw ApiError.notFound(`Usuario ${id} no encontrado`);
  return user;
}

async function createUser(data) {
  await assertRoleExists(data.role_id);
  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
  console.log('data', data);
  return repository.create(pool, {
    ...data,
    password: hashedPassword,
    business_id: env.defaultBusinessId,
  });
}

async function updateUser(id, data) {
  await getUser(id);
  await assertRoleExists(data.role_id);
  return repository.update(pool, id, data);
}

async function updateUserPassword(id, { password }) {
  await getUser(id);
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  await repository.updatePassword(pool, id, hashedPassword);
}

async function deleteUser(id) {
  await getUser(id);
  await repository.softDelete(pool, id);
}

module.exports = { listUsers, getUser, createUser, updateUser, updateUserPassword, deleteUser };
