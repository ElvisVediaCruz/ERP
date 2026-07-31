async function create(conn, { receipt_number, user_id, customer_id, total, payment_method_id }) {
  const [result] = await conn.execute(
    `INSERT INTO sales (receipt_number, user_id, customer_id, sale_date, total, payment_method_id)
     VALUES (?, ?, ?, NOW(), ?, ?)`,
    [receipt_number ?? null, user_id, customer_id ?? null, total, payment_method_id]
  );
  return result.insertId;
}

async function createDetail(conn, { sale_id, product_id, quantity, sale_price, subtotal }) {
  await conn.execute(
    `INSERT INTO sale_details (sale_id, product_id, quantity, sale_price, subtotal)
     VALUES (?, ?, ?, ?, ?)`,
    [sale_id, product_id, quantity, sale_price, subtotal]
  );
}

async function findById(db, id) {
  const [rows] = await db.execute('SELECT * FROM sales WHERE id = ?', [id]);
  return rows[0] ?? null;
}

async function findDetailsBySaleId(db, saleId) {
  const [rows] = await db.execute('SELECT * FROM sale_details WHERE sale_id = ?', [saleId]);
  return rows;
}

async function findAll(db, { limit, offset }) {
  const [rows] = await db.query(
    'SELECT * FROM sales ORDER BY sale_date DESC LIMIT ? OFFSET ?',
    [limit, offset]
  );
  const [countRows] = await db.query('SELECT COUNT(*) AS total FROM sales');
  return { rows, total: countRows[0].total };
}

module.exports = { create, createDetail, findById, findDetailsBySaleId, findAll };
