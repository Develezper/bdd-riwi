const fs = require('fs/promises');
const xlsx = require('xlsx');
const { pool } = require('../config/mysql');
const { normalizeDate } = require('../utils/date');
const { calculateInvoiceStatus } = require('../utils/invoice');
const { AppError } = require('../utils/appError');
const {
  upsertPlatform,
  getClientByIdentification,
  upsertClient,
  upsertInvoice,
  upsertTransaction
} = require('../repositories/migrationRepository');
const { syncHistoryByEmail, removeHistoryByEmail } = require('./historyService');

const COLUMNS = {
  txn_code: 'ID de la Transacción',
  txn_date: 'Fecha y Hora de la Transacción',
  amount: 'Monto de la Transacción',
  status: 'Estado de la Transacción',
  transaction_type: 'Tipo de Transacción',
  full_name: 'Nombre del Cliente',
  identification: 'Número de Identificación',
  address: 'Dirección',
  phone: 'Teléfono',
  email: 'Correo Electrónico',
  platform_name: 'Plataforma Utilizada',
  invoice_number: 'Número de Factura',
  billing_period: 'Periodo de Facturación',
  billed_amount: 'Monto Facturado',
  paid_amount: 'Monto Pagado'
};

function parseAmount(value) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return null;
  return parsed;
}

function hasValue(value) {
  if (value === null || value === undefined) return false;
  return String(value).trim() !== '';
}

function isRowEmpty(row) {
  return !Object.values(COLUMNS).some((columnName) => hasValue(row[columnName]));
}

function isNonDataRow(row) {
  const keyColumns = [
    COLUMNS.txn_code,
    COLUMNS.txn_date,
    COLUMNS.status,
    COLUMNS.full_name,
    COLUMNS.identification,
    COLUMNS.email,
    COLUMNS.platform_name,
    COLUMNS.invoice_number,
    COLUMNS.billing_period
  ];

  return keyColumns.every((columnName) => !hasValue(row[columnName]));
}

function mapRow(row, index) {
  const txnDate = normalizeDate(row[COLUMNS.txn_date]);
  const amount = parseAmount(row[COLUMNS.amount]);
  const billedAmount = parseAmount(row[COLUMNS.billed_amount]);
  const paidAmount = parseAmount(row[COLUMNS.paid_amount]);

  const mapped = {
    txn_code: String(row[COLUMNS.txn_code] || '').trim(),
    txn_date: txnDate,
    amount,
    status: String(row[COLUMNS.status] || '').trim(),
    transaction_type: String(row[COLUMNS.transaction_type] || '').trim() || 'Pago de Factura',
    full_name: String(row[COLUMNS.full_name] || '').trim(),
    identification: String(row[COLUMNS.identification] || '').trim(),
    address: String(row[COLUMNS.address] || '').trim(),
    phone: String(row[COLUMNS.phone] || '').trim(),
    email: String(row[COLUMNS.email] || '').trim().toLowerCase(),
    platform_name: String(row[COLUMNS.platform_name] || '').trim(),
    invoice_number: String(row[COLUMNS.invoice_number] || '').trim(),
    billing_period: String(row[COLUMNS.billing_period] || '').trim(),
    billed_amount: billedAmount,
    paid_amount: paidAmount,
    row_index: index + 2
  };

  const errors = [];

  const requiredFields = [
    'txn_code',
    'status',
    'full_name',
    'identification',
    'email',
    'platform_name',
    'invoice_number',
    'billing_period'
  ];

  for (const field of requiredFields) {
    if (!mapped[field]) {
      errors.push(`${field} is required`);
    }
  }

  if (!mapped.txn_date) errors.push('txn_date is invalid');
  if (mapped.amount === null) errors.push('amount is invalid');
  if (mapped.billed_amount === null) errors.push('billed_amount is invalid');
  if (mapped.paid_amount === null) errors.push('paid_amount is invalid');

  if (!['Pendiente', 'Completada', 'Fallida'].includes(mapped.status)) {
    errors.push('status must be Pendiente, Completada, or Fallida');
  }

  if (!/^\d{4}-\d{2}$/.test(mapped.billing_period)) {
    errors.push('billing_period must have format YYYY-MM');
  }

  return { mapped, errors };
}

async function readRowsFromFile(filePath) {
  const workbook = xlsx.readFile(filePath, { cellDates: true });
  const firstSheet = workbook.SheetNames[0];

  if (!firstSheet) {
    throw new AppError('Uploaded file has no sheets', 400);
  }

  const sheet = workbook.Sheets[firstSheet];
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: '', raw: true });

  if (rows.length === 0) {
    throw new AppError('Uploaded file has no data rows', 400);
  }

  return rows;
}

async function syncMongoForEmails(emails) {
  for (const email of emails) {
    await syncHistoryByEmail(email);
  }
}

async function removeMongoForEmails(emails) {
  for (const email of emails) {
    await removeHistoryByEmail(email);
  }
}

async function migrateFile(filePath) {
  let conn;
  const touchedEmails = new Set();
  const staleEmails = new Set();

  try {
    const rows = await readRowsFromFile(filePath);
    const rowsWithIndex = rows
      .map((row, index) => ({ row, index }))
      .filter(({ row }) => !isRowEmpty(row))
      .filter(({ row }) => !isNonDataRow(row));

    if (rowsWithIndex.length === 0) {
      throw new AppError('Uploaded file has no valid data rows', 400);
    }

    const rowErrors = [];
    const mappedRows = rowsWithIndex.map(({ row, index }) => {
      const result = mapRow(row, index);
      if (result.errors.length > 0) {
        rowErrors.push({ row: index + 2, errors: result.errors });
      }
      return result.mapped;
    });

    if (rowErrors.length > 0) {
      throw new AppError('Migration validation failed', 400, rowErrors.slice(0, 25));
    }

    conn = await pool.getConnection();
    await conn.beginTransaction();

    for (const row of mappedRows) {
      const platformId = await upsertPlatform(conn, row.platform_name);
      const existingClient = await getClientByIdentification(conn, row.identification);

      const clientId = await upsertClient(conn, {
        identification: row.identification,
        full_name: row.full_name,
        email: row.email,
        phone: row.phone,
        address: row.address
      });

      const previousEmail = existingClient?.email ? String(existingClient.email).toLowerCase() : null;
      const currentEmail = String(row.email).toLowerCase();

      if (previousEmail && previousEmail !== currentEmail) {
        staleEmails.add(previousEmail);
      }

      const invoiceId = await upsertInvoice(conn, {
        invoice_number: row.invoice_number,
        billing_period: row.billing_period,
        billed_amount: row.billed_amount,
        paid_amount: row.paid_amount,
        status: calculateInvoiceStatus(row.billed_amount, row.paid_amount),
        client_id: clientId
      });

      await upsertTransaction(conn, {
        txn_code: row.txn_code,
        txn_date: row.txn_date,
        amount: row.amount,
        status: row.status,
        transaction_type: row.transaction_type,
        client_id: clientId,
        platform_id: platformId,
        invoice_id: invoiceId
      });

      touchedEmails.add(row.email);
    }

    await conn.commit();

    const staleEmailsToRemove = [...staleEmails].filter((email) => !touchedEmails.has(email));
    await removeMongoForEmails(staleEmailsToRemove);
    await syncMongoForEmails(touchedEmails);

    return {
      rowsProcessed: mappedRows.length,
      clientsTouched: touchedEmails.size,
      staleHistoriesRemoved: staleEmailsToRemove.length,
      message: 'Migration completed successfully'
    };
  } catch (error) {
    if (conn) {
      await conn.rollback();
    }
    throw error;
  } finally {
    if (conn) {
      conn.release();
    }

    try {
      await fs.unlink(filePath);
    } catch (_) {
      // no-op
    }
  }
}

module.exports = {
  migrateFile
};
