function buildFilters({ category_id, supplier_id, status, search }) {
  const clauses = [];
  const params = [];

  if (category_id !== undefined) {
    clauses.push('category_id = ?');
    params.push(category_id);
  }
  if (supplier_id !== undefined) {
    clauses.push('supplier_id = ?');
    params.push(supplier_id);
  }
  if (status !== undefined) {
    clauses.push('status = ?');
    params.push(status);
  }
  if (search) {
    clauses.push('(name LIKE ? OR code LIKE ? OR barcode LIKE ?)');
    const like = `%${search}%`;
    params.push(like, like, like);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return { where, params };
}

async function findAll(db, filters, { limit, offset }) {
  const { where, params } = buildFilters(filters);
  const [rows] = await db.query(
    `SELECT * FROM products ${where} ORDER BY name LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [countRows] = await db.query(
    `SELECT COUNT(*) AS total FROM products ${where}`,
    params
  );
  return { rows, total: countRows[0].total };
}

async function findLowStock(db) {
  const [rows] = await db.query(
    'SELECT * FROM products WHERE status = TRUE AND stock <= minimum_stock ORDER BY name'
  );
  return rows;
}

async function findById(db, id) {
  const [rows] = await db.execute('SELECT * FROM products WHERE id = ?', [id]);
  return rows[0] ?? null;
}

async function findByCategorie(db, category_id){
  const [rows] = await db.execute(`
    select p.id, p.name, p.category_id, c.name AS category_name
    from categories c
    inner join products p
    on c.id =  p.category_id
    where c.id = ?`, [category_id]);
    return rows;
}

async function findByIdForUpdate(conn, id) {
  const [rows] = await conn.execute('SELECT * FROM products WHERE id = ? FOR UPDATE', [id]);
  return rows[0] ?? null;
}

async function create(db, data) {
  const [result] = await db.execute(
    `INSERT INTO products
      (category_id, supplier_id, code, barcode, name, description,
       purchase_price, sale_price, stock, minimum_stock, expiration_date, image, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.category_id ?? null,
      data.supplier_id ?? null,
      data.code ?? null,
      data.barcode ?? null,
      data.name,
      data.description ?? null,
      data.purchase_price,
      data.sale_price ?? null,
      data.stock ?? 0,
      data.minimum_stock ?? 0,
      data.expiration_date ?? null,
      data.image ?? null,
      null,
    ]
  );
  return findById(db, result.insertId);
}

async function update(db, id, data) {
  const values = [
    data.category_id ?? null,
    data.supplier_id ?? null,
    data.code ?? null,
    data.barcode ?? null,
    data.name,
    data.description ?? null,
    data.purchase_price,
    data.sale_price ?? null,
    data.minimum_stock ?? 0,
    data.expiration_date ?? null,
    data.image ?? null,
  ];
  await db.execute(
    `UPDATE products SET
      category_id = ?, supplier_id = ?, code = ?, barcode = ?, name = ?, description = ?,
      purchase_price = ?, sale_price = ?, minimum_stock = ?, expiration_date = ?, image = ?, updated_at = now()
     WHERE id = ?
     AND (
       NOT (category_id <=> ?) OR NOT (supplier_id <=> ?) OR NOT (code <=> ?) OR NOT (barcode <=> ?) OR
       NOT (name <=> ?) OR NOT (description <=> ?) OR NOT (purchase_price <=> ?) OR NOT (sale_price <=> ?) OR
       NOT (minimum_stock <=> ?) OR NOT (expiration_date <=> ?) OR NOT (image <=> ?)
     )`,
    [...values, id, ...values]
  );
  return findById(db, id);
}

async function updateStatus(db, id, status) {
  const [result] = await db.execute('UPDATE products SET status = ? WHERE id = ?', [status, id]);
  return result.affectedRows === 1;
}

async function hasRelatedRecords(db, id) {
  const [rows] = await db.query(
    `SELECT
      (SELECT COUNT(*) FROM sale_details WHERE product_id = ?) AS sales,
      (SELECT COUNT(*) FROM purchase_details WHERE product_id = ?) AS purchases,
      (SELECT COUNT(*) FROM inventory_movements WHERE product_id = ?) AS movements`,
    [id, id, id]
  );
  const { sales, purchases, movements } = rows[0];
  return sales > 0 || purchases > 0 || movements > 0;
}

async function remove(db, id) {
  const [result] = await db.execute('DELETE FROM products WHERE id = ?', [id]);
  return result.affectedRows === 1;
}

async function decrementStock(conn, id, quantity) {
  const [result] = await conn.execute(
    'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
    [quantity, id, quantity]
  );
  return result.affectedRows === 1;
}

async function incrementStock(conn, id, quantity) {
  const [result] = await conn.execute(
    'UPDATE products SET stock = stock + ? WHERE id = ?',
    [quantity, id]
  );
  return result.affectedRows === 1;
}

async function updateCategoryNoMatching(conn, data){
  const entries = Object.entries(data);
  const caseSQL = entries.map(() => 'WHEN ? THEN ?').join(' ');
  const caseParams = entries.flatMap(([product_id, category_id]) => [Number(product_id), Number(category_id)]);
  const idPlaceholders = entries.map(() => '?').join(',');
  const idParams = entries.map(([product_id]) => Number(product_id));
  const [result] = await conn.execute(
    `UPDATE products SET category_id = CASE id ${caseSQL} END WHERE id IN (${idPlaceholders})`,
    [...caseParams, ...idParams]
  );
  return result.affectedRows;
}
async function updateCategoryMatch(conn, productIds, category_id){
  const placeholders = productIds.map(() => '?').join(',');
  const [result] = await conn.execute(
    `UPDATE products SET category_id = ? WHERE id IN (${placeholders})`,
    [category_id, ...productIds]
  );
  return result.affectedRows;
}

module.exports = {
  findAll,
  findLowStock,
  findById,
  findByCategorie,
  findByIdForUpdate,
  create,
  update,
  updateStatus,
  hasRelatedRecords,
  remove,
  decrementStock,
  incrementStock,
  updateCategoryNoMatching,
  updateCategoryMatch
};
