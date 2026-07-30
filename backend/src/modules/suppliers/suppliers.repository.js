async function findAll(db, { status } = {}) {
  if (status === undefined) {
    const [rows] = await db.execute('SELECT * FROM suppliers ORDER BY company');
    return rows;
  }
  const [rows] = await db.execute(
    'SELECT * FROM suppliers WHERE status = ? ORDER BY company',
    [status]
  );
  return rows;
}

async function findById(db, id) {
  const [rows] = await db.execute('SELECT * FROM suppliers WHERE id = ?', [id]);
  return rows[0] ?? null;
}

async function exists(db, id) {
  const [rows] = await db.execute('SELECT id FROM suppliers WHERE id = ? AND status = TRUE', [id]);
  return rows.length > 0;
}

async function create(db, { company, contact_name, phone, email, address, description }) {
  const [result] = await db.execute(
    `INSERT INTO suppliers (company, contact_name, phone, email, address, description)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [company, contact_name ?? null, phone ?? null, email ?? null, address ?? null, description ?? null]
  );
  return findById(db, result.insertId);
}

async function update(db, id, { company, contact_name, phone, email, address, description }) {
  await db.execute(
    `UPDATE suppliers
     SET company = ?, contact_name = ?, phone = ?, email = ?, address = ?, description = ?
     WHERE id = ?`,
    [company, contact_name ?? null, phone ?? null, email ?? null, address ?? null, description ?? null, id]
  );
  return findById(db, id);
}

async function softDelete(db, id) {
  const [result] = await db.execute('UPDATE suppliers SET status = FALSE WHERE id = ?', [id]);
  return result.affectedRows === 1;
}

module.exports = { findAll, findById, exists, create, update, softDelete };
