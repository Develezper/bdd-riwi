const express = require('express');
const {
  totalPaidByClient,
  pendingInvoicesReport,
  transactionsByPlatform
} = require('../controllers/reportController');

const router = express.Router();

router.get('/total-paid-by-client', totalPaidByClient);
router.get('/pending-invoices', pendingInvoicesReport);
router.get('/transactions-by-platform', transactionsByPlatform);

module.exports = router;
