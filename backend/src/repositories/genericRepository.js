const mysql = require('mysql2');
const { pool } = require('../config/mysql');

function escapeId(value) {
  return mysql.escapeId(value);
}

function buildSelect(resource) {
  const columns = resource.selectFields.map((field) => escapeId(field)).join(', ');
  return `SELECT ${columns} FROM ${escapeId(resource.table)}`;
}

async function list(resource) {
  const sql = `${buildSelect(resource)} ORDER BY ${resource.orderBy} LIMIT 500`;
  const [rows] = await pool.query(sql);
  return rows;
}

async function getById(resource, id) {
  const sql = `${buildSelect(resource)} WHERE ${escapeId(resource.idField)} = ? LIMIT 1`;
  const [rows] = await pool.query(sql, [id]);
  return rows[0] || null;
}

async function create(resource, payload) {
  const fields = Object.keys(payload);
  const columns = fields.map((field) => escapeId(field)).join(', ');
  const placeholders = fields.map(() => '?').join(', ');
  const values = fields.map((field) => payload[field]);

  const sql = `INSERT INTO ${escapeId(resource.table)} (${columns}) VALUES (${placeholders})`;
  const [result] = await pool.query(sql, values);
  return getById(resource, result.insertId);
}

async function update(resource, id, payload) {
  const fields = Object.keys(payload);
  if (fields.length === 0) {
    return getById(resource, id);
  }

  const assignments = fields.map((field) => `${escapeId(field)} = ?`).join(', ');
  const values = fields.map((field) => payload[field]);
  values.push(id);

  const sql = `UPDATE ${escapeId(resource.table)} SET ${assignments} WHERE ${escapeId(resource.idField)} = ?`;
  await pool.query(sql, values);
  return getById(resource, id);
}

async function remove(resource, id) {
  const sql = `DELETE FROM ${escapeId(resource.table)} WHERE ${escapeId(resource.idField)} = ?`;
  const [result] = await pool.query(sql, [id]);
  return result.affectedRows > 0;
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove
};
