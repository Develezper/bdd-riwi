USE fintech_management;

-- 1) Total paid by each client
SELECT
  c.id,
  c.identification,
  c.full_name,
  c.email,
  ROUND(COALESCE(SUM(i.paid_amount), 0), 2) AS total_paid
FROM clients c
LEFT JOIN invoices i ON i.client_id = c.id
GROUP BY c.id, c.identification, c.full_name, c.email
ORDER BY total_paid DESC;

-- 2) Pending invoices with client and related transactions
SELECT
  i.id,
  i.invoice_number,
  i.billing_period,
  i.billed_amount,
  i.paid_amount,
  i.status AS invoice_status,
  c.full_name,
  c.identification,
  t.txn_code,
  t.txn_date,
  t.status AS transaction_status,
  t.amount
FROM invoices i
INNER JOIN clients c ON c.id = i.client_id
LEFT JOIN transactions t ON t.invoice_id = i.id
WHERE i.status IN ('PENDIENTE', 'PARCIAL')
ORDER BY i.billing_period DESC, i.invoice_number;

-- 3) Transactions by payment platform (example Nequi)
SELECT
  t.id,
  t.txn_code,
  t.txn_date,
  t.amount,
  t.status,
  t.transaction_type,
  p.name AS platform_name,
  c.full_name,
  c.identification,
  i.invoice_number
FROM transactions t
INNER JOIN platforms p ON p.id = t.platform_id
INNER JOIN clients c ON c.id = t.client_id
INNER JOIN invoices i ON i.id = t.invoice_id
WHERE p.name = 'Nequi'
ORDER BY t.txn_date DESC;
