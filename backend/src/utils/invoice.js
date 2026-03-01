function calculateInvoiceStatus(billedAmount, paidAmount) {
  const billed = Number(billedAmount || 0);
  const paid = Number(paidAmount || 0);

  if (paid <= 0) return 'PENDIENTE';
  if (paid < billed) return 'PARCIAL';
  return 'PAGADA';
}

module.exports = { calculateInvoiceStatus };
