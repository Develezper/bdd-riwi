# Normalization Analysis (1NF, 2NF, 3NF)

## Source dataset context
The source file (`data.xlsx`) contains a flat table with mixed information:

- Transaction data
- Client personal data
- Payment platform data
- Invoice data

Main columns detected:
- `ID de la Transacción`
- `Fecha y Hora de la Transacción`
- `Monto de la Transacción`
- `Estado de la Transacción`
- `Tipo de Transacción`
- `Nombre del Cliente`
- `Número de Identificación`
- `Dirección`
- `Teléfono`
- `Correo Electrónico`
- `Plataforma Utilizada`
- `Número de Factura`
- `Periodo de Facturación`
- `Monto Facturado`
- `Monto Pagado`

## 1NF (First Normal Form)
Goal: atomic values and one fact per column.

Actions:
- Keep all source attributes atomic in relational columns.
- Keep one transaction per row (`txn_code` as business unique key).

Result:
- Atomic columns with no repeating groups inside one table row.

## 2NF (Second Normal Form)
Goal: remove partial dependencies from transaction-level records.

Observed dependencies:
- Client attributes depend on client identity, not on transaction identity.
- Platform name depends on platform entity, not on transaction identity.
- Invoice attributes depend on invoice number, not on transaction identity.

Actions:
- Split into entity tables:
  - `clients`
  - `platforms`
  - `invoices`
  - `transactions`

Result:
- Non-key columns are fully dependent on their table key.

## 3NF (Third Normal Form)
Goal: remove transitive dependencies.

Examples removed:
- `client_name`, `email`, `phone`, `address` are not stored in `transactions` as master attributes.
- `platform_name` is not duplicated in transaction as master data.
- Invoice financial context is centralized in `invoices` and referenced by `invoice_id`.

Result:
- Clean relational model with explicit foreign keys.
- Better consistency and update safety.

## Final relational design
- `clients(id, identification, full_name, email, phone, address, ...)`
- `platforms(id, name, ...)`
- `invoices(id, invoice_number, billing_period, billed_amount, paid_amount, status, client_id, ...)`
- `transactions(id, txn_code, txn_date, amount, status, transaction_type, client_id, platform_id, invoice_id, ...)`

## Why this model is correct for the challenge
- Meets 3NF and referential integrity requirements.
- Supports idempotent migration from Excel.
- Supports mandatory CRUD and reports.
- Supports Mongo denormalized history synchronization.
