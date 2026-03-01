require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { pool } = require('./config/mysql');
const { connectMongo } = require('./config/mongo');
const routes = require('./routes');
const { notFound } = require('./middlewares/notFound');
const { errorHandler } = require('./middlewares/errorHandler');

async function bootstrap() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', async (req, res, next) => {
    try {
      await pool.query('SELECT 1 AS db_ok');
      res.json({ success: true, message: 'Service is healthy' });
    } catch (error) {
      next(error);
    }
  });

  app.use('/api', routes);
  app.use(notFound);
  app.use(errorHandler);

  await pool.query('SELECT 1');
  await connectMongo();

  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend running on http://localhost:${port}`);
  });
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start application:', error.message);
  process.exit(1);
});
