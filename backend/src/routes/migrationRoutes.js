const express = require('express');
const { upload } = require('../utils/upload');
const { uploadAndMigrate } = require('../controllers/migrationController');

const router = express.Router();

router.post('/upload', upload.single('file'), uploadAndMigrate);

module.exports = router;
