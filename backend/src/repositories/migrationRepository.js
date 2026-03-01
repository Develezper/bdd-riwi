async function upsertPlatform(conn, name) {
  const [result] = await conn.query(
    `INSERT INTO platforms (name)
     VALUES (?)
     ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id), name = VALUES(name)`,
    [name]
  );

  return result.insertId;
}

async function getClientByIdentification(conn, identification) {
  const [rows] = await conn.query(
    `SELECT id, email
     FROM clients
     WHERE identification = ?
     LIMIT 1`,
    [identification]
  );

  return rows[0] || null;
}

async function upsertClient(conn, client) {
  const [result] = await conn.query(
    `INSERT INTO clients (identification, full_name, email, phone, address)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
      id = LAST_INSERT_ID(id),
      full_name = VALUES(full_name),
      email = VALUES(email),
      phone = VALUES(phone),
      address = VALUES(address),
      updated_at = CURRENT_TIMESTAMP`,
    [
      client.identification,
      client.full_name,
      client.email,
      client.phone,
      client.address
    ]
  );

  return result.insertId;
}

async function upsertInvoice(conn, invoice) {
  const [result] = await conn.query(
    `INSERT INTO invoices (invoice_number, billing_period, billed_amount, paid_amount, status, client_id)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
      id = LAST_INSERT_ID(id),
      billing_period = VALUES(billing_period),
      billed_amount = VALUES(billed_amount),
      paid_amount = VALUES(paid_amount),
      status = VALUES(status),
      client_id = VALUES(client_id),
      updated_at = CURRENT_TIMESTAMP`,
    [
      invoice.invoice_number,
      invoice.billing_period,
      invoice.billed_amount,
      invoice.paid_amount,
      invoice.status,
      invoice.client_id
    ]
  );

  return result.insertId;
}

async function upsertTransaction(conn, transaction) {
  const [result] = await conn.query(
    `INSERT INTO transactions (
      txn_code,
      txn_date,
      amount,
      status,
      transaction_type,
      client_id,
      platform_id,
      invoice_id
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
      id = LAST_INSERT_ID(id),
      txn_date = VALUES(txn_date),
      amount = VALUES(amount),
      status = VALUES(status),
      transaction_type = VALUES(transaction_type),
      client_id = VALUES(client_id),
      platform_id = VALUES(platform_id),
      invoice_id = VALUES(invoice_id),
      updated_at = CURRENT_TIMESTAMP`,
    [
      transaction.txn_code,
      transaction.txn_date,
      transaction.amount,
      transaction.status,
      transaction.transaction_type,
      transaction.client_id,
      transaction.platform_id,
      transaction.invoice_id
    ]
  );

  return result.insertId;
}

async function fetchClientHistoryRows(conn, clientEmail) {
  const [rows] = await conn.query(
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
    [clientEmail]
  );

  return rows;
}

module.exports = {
  upsertPlatform,
  getClientByIdentification,
  upsertClient,
  upsertInvoice,
  upsertTransaction,
  fetchClientHistoryRows
};
