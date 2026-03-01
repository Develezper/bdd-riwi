const clientRepository = require('../repositories/clientRepository');
const { validateClientPayload } = require('../utils/validators');
const { AppError } = require('../utils/appError');
const { syncHistoryByEmail, removeHistoryByEmail } = require('./historyService');

function normalizeClientPayload(payload) {
  const normalized = {};

  if (payload.identification !== undefined) {
    normalized.identification = String(payload.identification).trim();
  }
  if (payload.full_name !== undefined) {
    normalized.full_name = String(payload.full_name).trim();
  }
  if (payload.email !== undefined) {
    normalized.email = String(payload.email).trim().toLowerCase();
  }
  if (payload.phone !== undefined) {
    normalized.phone = String(payload.phone).trim();
  }
  if (payload.address !== undefined) {
    normalized.address = String(payload.address).trim();
  }

  return normalized;
}

async function listClients() {
  return clientRepository.listClients();
}

async function getClientById(id) {
  const client = await clientRepository.getClientById(id);
  if (!client) {
    throw new AppError('Client not found', 404);
  }
  return client;
}

async function createClient(payload) {
  const normalized = normalizeClientPayload(payload);
  const errors = validateClientPayload(normalized);

  if (errors.length > 0) {
    throw new AppError('Validation failed', 400, errors);
  }

  try {
    const created = await clientRepository.createClient(normalized);
    await syncHistoryByEmail(created.email);
    return created;
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new AppError('Client identification or email already exists', 409);
    }
    throw error;
  }
}

async function updateClient(id, payload) {
  const existing = await clientRepository.getClientById(id);
  if (!existing) {
    throw new AppError('Client not found', 404);
  }

  const normalized = normalizeClientPayload(payload);
  const errors = validateClientPayload(normalized, { partial: true });
  if (errors.length > 0) {
    throw new AppError('Validation failed', 400, errors);
  }

  try {
    const updated = await clientRepository.updateClient(id, normalized);

    if (existing.email && existing.email !== updated.email) {
      await removeHistoryByEmail(existing.email);
    }

    await syncHistoryByEmail(updated.email);
    return updated;
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new AppError('Client identification or email already exists', 409);
    }
    throw error;
  }
}

async function deleteClient(id) {
  const existing = await clientRepository.getClientById(id);
  if (!existing) {
    throw new AppError('Client not found', 404);
  }

  try {
    const deleted = await clientRepository.deleteClient(id);
    if (!deleted) {
      throw new AppError('Client not found', 404);
    }

    await removeHistoryByEmail(existing.email);
    return true;
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      throw new AppError('Client has related invoices/transactions and cannot be deleted', 409);
    }
    throw error;
  }
}

module.exports = {
  listClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
};
