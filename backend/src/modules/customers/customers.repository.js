async function exists(db, id) {
  const [rows] = await db.execute('SELECT id FROM customers WHERE id = ? AND status = TRUE', [id]);
  return rows.length > 0;
}

module.exports = { exists };
