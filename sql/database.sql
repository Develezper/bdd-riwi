CREATE DATABASE IF NOT EXISTS fintech_management
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE fintech_management;

CREATE TABLE IF NOT EXISTS clients (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  identification VARCHAR(50) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_clients_identification UNIQUE (identification),
  CONSTRAINT uq_clients_email UNIQUE (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS platforms (
  id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_platforms_name UNIQUE (name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS invoices (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  invoice_number VARCHAR(50) NOT NULL,
  billing_period CHAR(7) NOT NULL,
  billed_amount DECIMAL(15,2) NOT NULL,
  paid_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  status ENUM('PENDIENTE', 'PARCIAL', 'PAGADA') NOT NULL,
  client_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_invoices_invoice_number UNIQUE (invoice_number),
  CONSTRAINT chk_invoices_billed_amount CHECK (billed_amount >= 0),
  CONSTRAINT chk_invoices_paid_amount CHECK (paid_amount >= 0),
  CONSTRAINT chk_invoices_period_format CHECK (billing_period REGEXP '^[0-9]{4}-[0-9]{2}$'),
  CONSTRAINT fk_invoices_client
    FOREIGN KEY (client_id)
    REFERENCES clients(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  INDEX idx_invoices_client_id (client_id),
  INDEX idx_invoices_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS transactions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  txn_code VARCHAR(50) NOT NULL,
  txn_date DATETIME NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  status ENUM('Pendiente', 'Completada', 'Fallida') NOT NULL,
  transaction_type VARCHAR(50) NOT NULL,
  client_id INT UNSIGNED NOT NULL,
  platform_id TINYINT UNSIGNED NOT NULL,
  invoice_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_transactions_txn_code UNIQUE (txn_code),
  CONSTRAINT chk_transactions_amount CHECK (amount >= 0),
  CONSTRAINT fk_transactions_client
    FOREIGN KEY (client_id)
    REFERENCES clients(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_transactions_platform
    FOREIGN KEY (platform_id)
    REFERENCES platforms(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_transactions_invoice
    FOREIGN KEY (invoice_id)
    REFERENCES invoices(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  INDEX idx_transactions_txn_date (txn_date),
  INDEX idx_transactions_client_id (client_id),
  INDEX idx_transactions_platform_id (platform_id),
  INDEX idx_transactions_invoice_id (invoice_id),
  INDEX idx_transactions_status (status)
) ENGINE=InnoDB;
