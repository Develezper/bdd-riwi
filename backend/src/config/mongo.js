const mongoose = require('mongoose');

async function connectMongo() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not configured');
  }

  await mongoose.connect(process.env.MONGO_URI, {
    autoIndex: true
  });
}

module.exports = { connectMongo };
