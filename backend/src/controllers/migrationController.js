const { migrateFile } = require('../services/migrationService');
const { AppError } = require('../utils/appError');

async function uploadAndMigrate(req, res, next) {
  try {
    if (!req.file) {
      throw new AppError('file is required (xlsx/csv)', 400);
    }

    const data = await migrateFile(req.file.path);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

module.exports = { uploadAndMigrate };
