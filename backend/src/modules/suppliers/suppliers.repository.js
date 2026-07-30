async function findAll(db, { status, limit, offset } = {}) {
  if (status === undefined) {
    const [rows] = await db.query('SELECT * FROM suppliers ORDER BY company LIMIT ? OFFSET ?', [limit, offset]);
    const [countRows] = await db.execute('SELECT COUNT(*) AS total FROM suppliers');
    return { rows, total: countRows[0].total };
  }
  const [rows] = await db.query(
    'SELECT * FROM suppliers WHERE status = ? ORDER BY company LIMIT ? OFFSET ?',
    [status, limit, offset]
  );
  const [countRows] = await db.execute('SELECT COUNT(*) AS total FROM suppliers WHERE status = ?', [status]);
  return { rows, total: countRows[0].total };
}

async function findById(db, id) {
  const [rows] = await db.execute('SELECT * FROM suppliers WHERE id = ?', [id]);
  return rows[0] ?? null;
}

async function findByName(db, contact_name) {
  const [rows] = await db.execute('select id from suppliers where contact_name = ?', [contact_name]);
  return rows;
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
  const values = [
    company,
    contact_name ?? null,
    phone ?? null,
    email ?? null,
    address ?? null,
    description ?? null,
  ];
  await db.execute(
    `UPDATE suppliers
     SET company = ?, contact_name = ?, phone = ?, email = ?, address = ?, description = ?, updated_at = now()
     WHERE id = ?
     AND (
       NOT (company <=> ?) OR NOT (contact_name <=> ?) OR NOT (phone <=> ?) OR
       NOT (email <=> ?) OR NOT (address <=> ?) OR NOT (description <=> ?)
     )`,
    [...values, id, ...values]
  );
  return findById(db, id);
}

async function softDelete(db, id) {
  const [result] = await db.execute('UPDATE suppliers SET status = FALSE WHERE id = ?', [id]);
  return result.affectedRows === 1;
}

module.exports = { findAll, findById, findByName, exists, create, update, softDelete };
