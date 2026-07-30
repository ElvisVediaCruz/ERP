const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../../config/db');
const env = require('../../config/env');
const ApiError = require('../../shared/errors/ApiError');
const usersRepository = require('../users/users.repository');

async function login({ username, password }) {
  const user = await usersRepository.findByUsername(pool, username);
  if (!user || !user.status) {
    throw ApiError.unauthorized('Usuario o contraseña incorrectos');
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    throw ApiError.unauthorized('Usuario o contraseña incorrectos');
  }

  const token = jwt.sign(
    {
      id: user.id,
      business_id: user.business_id,
      role_id: user.role_id,
      role_name: user.role_name,
    },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      last_name: user.last_name,
      username: user.username,
      role_id: user.role_id,
      role_name: user.role_name,
    },
  };
}

module.exports = { login };
