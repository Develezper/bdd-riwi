const { pool } = require('../config/mysql');

async function listClients() {
  const [rows] = await pool.query(
    `SELECT id, identification, full_name, email, phone, address, created_at, updated_at
     FROM clients
     ORDER BY id ASC`
  );
  return rows;
}

async function getClientById(id) {
  const [rows] = await pool.query(
    `SELECT id, identification, full_name, email, phone, address, created_at, updated_at
     FROM clients
     WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function createClient({ identification, full_name, email, phone, address }) {
  const [result] = await pool.query(
    `INSERT INTO clients (identification, full_name, email, phone, address)
     VALUES (?, ?, ?, ?, ?)`,
    [identification, full_name, email, phone || null, address || null]
  );

  return getClientById(result.insertId);
}

async function updateClient(id, payload) {
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(payload)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }

  if (fields.length === 0) {
    return getClientById(id);
  }

  values.push(id);

  await pool.query(
    `UPDATE clients
     SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    values
  );

  return getClientById(id);
}

async function deleteClient(id) {
  const [result] = await pool.query('DELETE FROM clients WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  listClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
};
