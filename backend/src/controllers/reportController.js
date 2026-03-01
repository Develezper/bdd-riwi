const reportService = require('../services/reportService');

async function totalPaidByClient(req, res, next) {
  try {
    const data = await reportService.totalPaidByClient();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function pendingInvoicesReport(req, res, next) {
  try {
    const data = await reportService.pendingInvoicesReport();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function transactionsByPlatform(req, res, next) {
  try {
    const data = await reportService.transactionsByPlatform(req.query.platform);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  totalPaidByClient,
  pendingInvoicesReport,
  transactionsByPlatform
};
