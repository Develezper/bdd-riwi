const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    txnCode: { type: String, required: true },
    date: { type: Date, required: true },
    platform: { type: String, required: true },
    invoiceNumber: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, required: true },
    transactionType: { type: String, required: true }
  },
  { _id: false }
);

const clientHistorySchema = new mongoose.Schema(
  {
    clientEmail: { type: String, required: true, unique: true, index: true },
    clientName: { type: String, required: true },
    identification: { type: String, required: true },
    transactions: { type: [transactionSchema], default: [] },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    collection: 'client_histories',
    versionKey: false
  }
);

module.exports = mongoose.model('ClientHistory', clientHistorySchema);
