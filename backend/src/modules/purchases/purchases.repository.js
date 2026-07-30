async function create(conn, { supplier_id, user_id, invoice_number, total, description }) {
  const [result] = await conn.execute(
    `INSERT INTO purchases (supplier_id, user_id, invoice_number, purchase_date, total, description)
     VALUES (?, ?, ?, NOW(), ?, ?)`,
    [supplier_id, user_id, invoice_number ?? null, total, description ?? null]
  );
  return result.insertId;
}

async function createDetail(conn, { purchase_id, product_id, quantity, purchase_price, subtotal, description }) {
  await conn.execute(
    `INSERT INTO purchase_details (purchase_id, product_id, quantity, purchase_price, subtotal, description)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [purchase_id, product_id, quantity, purchase_price, subtotal, description ?? null]
  );
}

async function findById(db, id) {
  const [rows] = await db.execute('SELECT * FROM purchases WHERE id = ?', [id]);
  return rows[0] ?? null;
}

async function findDetailsByPurchaseId(db, purchaseId) {
  const [rows] = await db.execute(
    'SELECT * FROM purchase_details WHERE purchase_id = ?',
    [purchaseId]
  );
  return rows;
}

async function findAll(db, { limit, offset }) {
  const [rows] = await db.query(
    'SELECT * FROM purchases ORDER BY purchase_date DESC LIMIT ? OFFSET ?',
    [limit, offset]
  );
  const [countRows] = await db.query('SELECT COUNT(*) AS total FROM purchases');
  return { rows, total: countRows[0].total };
}

module.exports = { create, createDetail, findById, findDetailsByPurchaseId, findAll };
