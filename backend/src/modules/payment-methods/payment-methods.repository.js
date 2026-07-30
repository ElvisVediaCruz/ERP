async function findAll(db) {
  const [rows] = await db.execute('SELECT * FROM method_payment WHERE status = TRUE ORDER BY name');
  return rows;
}

async function findById(db, id) {
  const [rows] = await db.execute('SELECT * FROM method_payment WHERE id = ?', [id]);
  return rows[0] ?? null;
}

async function exists(db, id) {
  const [rows] = await db.execute(
    'SELECT id FROM method_payment WHERE id = ? AND status = TRUE',
    [id]
  );
  return rows.length > 0;
}

async function create(db, { name, description }) {
  const [result] = await db.execute(
    'INSERT INTO method_payment (name, description) VALUES (?, ?)',
    [name, description ?? null]
  );
  return findById(db, result.insertId);
}

async function update(db, id, { name, description }) {
  await db.execute(
    'UPDATE method_payment SET name = ?, description = ? WHERE id = ?',
    [name, description ?? null, id]
  );
  return findById(db, id);
}

async function softDelete(db, id) {
  const [result] = await db.execute('UPDATE method_payment SET status = FALSE WHERE id = ?', [id]);
  return result.affectedRows === 1;
}

module.exports = { findAll, findById, exists, create, update, softDelete };
