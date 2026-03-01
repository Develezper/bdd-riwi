const ClientHistory = require('../models/ClientHistory');
const { pool } = require('../config/mysql');

async function getHistoryRowsByEmail(email) {
  const [rows] = await pool.query(
    `SELECT
      c.email,
      c.full_name,
      c.identification,
      t.txn_code,
      t.txn_date,
      t.amount,
      t.status,
      t.transaction_type,
      p.name AS platform_name,
      i.invoice_number
    FROM clients c
    LEFT JOIN transactions t ON t.client_id = c.id
    LEFT JOIN platforms p ON p.id = t.platform_id
    LEFT JOIN invoices i ON i.id = t.invoice_id
    WHERE c.email = ?
    ORDER BY t.txn_date DESC`,
    [email]
  );

  return rows;
}

function buildHistoryDocument(rows) {
  if (!rows || rows.length === 0) return null;

  const base = rows[0];

  const transactions = rows
    .filter((row) => row.txn_code)
    .map((row) => ({
      txnCode: row.txn_code,
      date: row.txn_date,
      platform: row.platform_name,
      invoiceNumber: row.invoice_number,
      amount: Number(row.amount),
      status: row.status,
      transactionType: row.transaction_type
    }));

  return {
    clientEmail: base.email,
    clientName: base.full_name,
    identification: base.identification,
    transactions,
    updatedAt: new Date()
  };
}

async function syncHistoryByEmail(email) {
  const rows = await getHistoryRowsByEmail(email);
  const doc = buildHistoryDocument(rows);

  if (!doc) return null;

  await ClientHistory.updateOne(
    { clientEmail: doc.clientEmail },
    { $set: doc },
    { upsert: true }
  );

  return doc;
}

async function removeHistoryByEmail(email) {
  await ClientHistory.deleteOne({ clientEmail: email });
}

async function getHistoryByEmail(email) {
  let doc = await ClientHistory.findOne({ clientEmail: email }).lean();

  if (!doc) {
    await syncHistoryByEmail(email);
    doc = await ClientHistory.findOne({ clientEmail: email }).lean();
  }

  return doc;
}

module.exports = {
  syncHistoryByEmail,
  getHistoryByEmail,
  removeHistoryByEmail
};
