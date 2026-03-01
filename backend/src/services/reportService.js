const reportRepository = require('../repositories/reportRepository');
const { AppError } = require('../utils/appError');

async function totalPaidByClient() {
  return reportRepository.totalPaidByClient();
}

async function pendingInvoicesReport() {
  return reportRepository.pendingInvoicesReport();
}

async function transactionsByPlatform(platform) {
  if (!platform || String(platform).trim() === '') {
    throw new AppError('platform query param is required', 400);
  }

  return reportRepository.transactionsByPlatform(String(platform).trim());
}

module.exports = {
  totalPaidByClient,
  pendingInvoicesReport,
  transactionsByPlatform
};
