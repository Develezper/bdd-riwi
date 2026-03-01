const clientService = require('../services/clientService');
const { getHistoryByEmail } = require('../services/historyService');
const { AppError } = require('../utils/appError');

async function listClients(req, res, next) {
  try {
    const data = await clientService.listClients();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function getClient(req, res, next) {
  try {
    const id = Number(req.params.id);
    const data = await clientService.getClientById(id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function createClient(req, res, next) {
  try {
    const data = await clientService.createClient(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function updateClient(req, res, next) {
  try {
    const id = Number(req.params.id);
    const data = await clientService.updateClient(id, req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function deleteClient(req, res, next) {
  try {
    const id = Number(req.params.id);
    await clientService.deleteClient(id);
    res.json({ success: true, message: 'Client deleted successfully' });
  } catch (error) {
    next(error);
  }
}

async function getClientHistory(req, res, next) {
  try {
    const email = String(req.params.email || '').trim().toLowerCase();
    if (!email) {
      throw new AppError('email is required', 400);
    }

    const data = await getHistoryByEmail(email);
    if (!data) {
      throw new AppError('Client history not found', 404);
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  getClientHistory
};
