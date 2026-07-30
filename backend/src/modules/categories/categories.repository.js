const atributes = ['id', 'name', 'description', 'status'];

async function findAll(db, { status, limit, offset } = {}) {
  if (status === undefined) {
    const [rows] = await db.query(
      `SELECT ${atributes}
      FROM categories ORDER BY name LIMIT ? OFFSET ?`, [limit, offset]);
    const [countRows] = await db.execute('SELECT COUNT(*) AS total FROM categories');
    return { rows, total: countRows[0].total };
  }
  const [rows] = await db.query(
    `SELECT ${atributes} FROM categories WHERE status = ? ORDER BY name LIMIT ? OFFSET ?`,
    [status, limit, offset]
  );
  const [countRows] = await db.execute(
    'SELECT COUNT(*) AS total FROM categories WHERE status = ?',
    [status]
  );
  return { rows, total: countRows[0].total };
}

async function findOtherCategories(db, id){
  const [rows] = await db.execute('select id, name from categories where id <> ?', [id]);
  return rows;
}

async function findById(db, id) {
  const [rows] = await db.execute('SELECT * FROM categories WHERE id = ?', [id]);
  return rows[0] ?? null;
}

async function exists(db, id) {
  const [rows] = await db.execute('SELECT id FROM categories WHERE id = ? AND status = TRUE', [id]);
  return rows.length > 0;
}

async function create(db, { name, description }) {
  const [result] = await db.execute(
    'INSERT INTO categories (name, description) VALUES (?, ?)',
    [name, description ?? null]
  );
  return findById(db, result.insertId);
}

async function update(db, id, { name, description }) {
  await db.execute(
    `UPDATE categories 
    SET name = ?, description = ?, updated_at = now()
    WHERE id = ?
    AND (
      name <> ? OR description <> ?)`,
    [name, description, id, name, description]
  );
  return findById(db, id);
}

async function updateStatus(db, id, status){
  const [result] = await db.execute(`UPDATE categories SET status = ?, updated_at = now() WHERE id = ?`, [status, id]);
  return result.affectedRows === 1;
}

async function remove(db, id){
  const [result] = await db.execute('DELETE FROM categories WHERE id = ?', [id]);
  return result.affectedRows === 1;
}

async function findByName(db, name){
  const [rows] = await db.execute('SELECT id FROM categories WHERE name = ?', [name]);
  return rows;
}

module.exports = {
  findAll,
  findOtherCategories,
  findById,
  findByName,
  exists,
  create,
  update,
  updateStatus,
  remove
};
