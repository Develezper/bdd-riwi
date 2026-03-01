const express = require('express');
const clientRoutes = require('./clientRoutes');
const reportRoutes = require('./reportRoutes');
const migrationRoutes = require('./migrationRoutes');
const genericRoutes = require('./genericRoutes');

const router = express.Router();

router.use('/', genericRoutes);
router.use('/clients', clientRoutes);
router.use('/reports', reportRoutes);
router.use('/migration', migrationRoutes);

module.exports = router;
