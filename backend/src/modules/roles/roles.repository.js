async function exists(db, id) {
  const [rows] = await db.execute('SELECT id FROM roles WHERE id = ?', [id]);
  return rows.length > 0;
}
async function existName(db, name){
  const [rows] = await db.execute('SELECT id FROM roles WHERE name = ?', [name]);
  return rows.length > 0;
}
async function create(db, {name, description}){
  const [result] = await db.execute(`
    INSERT INTO roles (name, description)
    VALUES (?, ?)`, [name, description]);
  return result.insertId;
}

module.exports = { exists, create, existName };
