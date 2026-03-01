const express = require('express');
const {
  listClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  getClientHistory
} = require('../controllers/clientController');

const router = express.Router();

router.get('/', listClients);
router.get('/:email/history', getClientHistory);
router.get('/:id(\\d+)', getClient);
router.post('/', createClient);
router.put('/:id(\\d+)', updateClient);
router.delete('/:id(\\d+)', deleteClient);

module.exports = router;
