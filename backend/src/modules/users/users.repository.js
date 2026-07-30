async function exists(db, id) {
  const [rows] = await db.execute('SELECT id FROM users WHERE id = ? AND status = TRUE', [id]);
  return rows.length > 0;
}

async function findAll(db) {
  const [rows] = await db.execute(
    `SELECT u.id, u.name, u.last_name, u.username, u.role_id, r.name AS role_name
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.status = TRUE
     ORDER BY u.name`
  );
  return rows;
}

async function findById(db, id) {
  const [rows] = await db.execute(
    `SELECT u.id, u.name, u.last_name, u.username, u.role_id, r.name AS role_name
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.id = ?`,
    [id]
  );
  return rows[0] ?? null;
}

async function findByUsername(db, username) {
  const [rows] = await db.execute(
    `SELECT u.id, u.business_id, u.role_id, u.name, u.last_name, u.username,
            u.password, u.status, r.name AS role_name
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.username = ?`,
    [username]
  );
  return rows[0] ?? null;
}

async function create(db,
  { business_id, role_id, name, last_name, username, password, image, documents }) {
  const [result] = await db.execute(
    `INSERT INTO users (business_id, role_id, name, last_name, username, password, image, documents)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [business_id, role_id, name, last_name ?? null, username, password, image ?? null, documents ?? null]
  );
  return findById(db, result.insertId);
}

async function update(db, id, 
  { role_id, name, last_name, username, image, documents }) {
  await db.execute(
    `UPDATE users
     SET role_id = ?, name = ?, last_name = ?, username = ?, image = ?, documents = ?
     WHERE id = ?`,
    [role_id, name, last_name ?? null, username, image ?? null, documents ?? null, id]
  );
  return findById(db, id);
}

async function updatePassword(db, id, hashedPassword) {
  const [result] = await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
  return result.affectedRows === 1;
}

async function softDelete(db, id) {
  const [result] = await db.execute('UPDATE users SET status = FALSE WHERE id = ?', [id]);
  return result.affectedRows === 1;
}

module.exports = { exists, findAll, findById, findByUsername, create, update, updatePassword, softDelete };
