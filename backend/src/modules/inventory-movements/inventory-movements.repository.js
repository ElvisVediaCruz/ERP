async function create(conn, { product_id, user_id, type, quantity, reference, observation }) {
  const [result] = await conn.execute(
    `INSERT INTO inventory_movements
      (product_id, user_id, type, quantity, movement_date, reference, observation)
     VALUES (?, ?, ?, ?, NOW(), ?, ?)`,
    [product_id, user_id, type, quantity, reference ?? null, observation ?? null]
  );
  return result.insertId;
}

module.exports = { create };
