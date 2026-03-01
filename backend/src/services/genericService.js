const { getResourceConfig, listResourceConfigs } = require('../config/genericResources');
const genericRepository = require('../repositories/genericRepository');
const { AppError } = require('../utils/appError');

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

function parseId(rawId) {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('id must be a positive integer', 400);
  }
  return id;
}

function getResourceOrThrow(resourceKey) {
  const resource = getResourceConfig(resourceKey);
  if (!resource) {
    throw new AppError(`Unknown resource: ${resourceKey}`, 404);
  }
  return resource;
}

function normalizeValue(field, value) {
  if (value === undefined) return undefined;

  if (typeof value === 'string') {
    value = value.trim();
  }

  if ((value === '' || value === null) && field.nullable) {
    return null;
  }

  if ((value === '' || value === null) && !field.required) {
    return field.nullable ? null : value;
  }

  if (field.type === 'string') {
    const normalized = String(value);
    if (field.maxLength && normalized.length > field.maxLength) {
      throw new AppError(`${field.name} max length is ${field.maxLength}`, 400);
    }
    return normalized;
  }

  if (field.type === 'email') {
    const normalized = String(value).toLowerCase();
    if (field.maxLength && normalized.length > field.maxLength) {
      throw new AppError(`${field.name} max length is ${field.maxLength}`, 400);
    }
    if (!isValidEmail(normalized)) {
      throw new AppError(`${field.name} is invalid`, 400);
    }
    return normalized;
  }

  if (field.type === 'number') {
    const normalized = Number(value);
    if (Number.isNaN(normalized)) {
      throw new AppError(`${field.name} must be a number`, 400);
    }
    return normalized;
  }

  if (field.type === 'integer') {
    const normalized = Number(value);
    if (!Number.isInteger(normalized)) {
      throw new AppError(`${field.name} must be an integer`, 400);
    }
    return normalized;
  }

  if (field.type === 'date') {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new AppError(`${field.name} must be a valid date`, 400);
    }
    return date;
  }

  if (field.type === 'enum') {
    const normalized = String(value);
    if (!field.enum || !field.enum.includes(normalized)) {
      throw new AppError(`${field.name} must be one of: ${field.enum.join(', ')}`, 400);
    }
    return normalized;
  }

  return value;
}

function validatePayload(resource, payload, mode) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new AppError('payload must be an object', 400);
  }

  const allowedFields = resource.fields.filter((field) => (mode === 'create' ? field.create : field.update));
  const allowedNames = new Set(allowedFields.map((field) => field.name));
  const normalized = {};

  for (const [key, value] of Object.entries(payload)) {
    if (!allowedNames.has(key)) {
      throw new AppError(`field "${key}" is not allowed`, 400);
    }

    const field = allowedFields.find((item) => item.name === key);
    normalized[key] = normalizeValue(field, value);
  }

  if (mode === 'create') {
    for (const field of allowedFields) {
      if (!field.required) continue;
      const value = normalized[field.name];
      if (value === undefined || value === null || value === '') {
        throw new AppError(`${field.name} is required`, 400);
      }
    }

    if (Object.keys(normalized).length === 0) {
      throw new AppError('At least one field is required', 400);
    }
  }

  if (mode === 'update' && Object.keys(normalized).length === 0) {
    throw new AppError('At least one field is required', 400);
  }

  return normalized;
}

function mapDatabaseError(error) {
  if (error.code === 'ER_DUP_ENTRY') {
    throw new AppError('Duplicate value on unique field', 409);
  }
  if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    throw new AppError('Related record does not exist', 409);
  }
  if (error.code === 'ER_ROW_IS_REFERENCED_2') {
    throw new AppError('Record has related data and cannot be deleted', 409);
  }
  throw error;
}

async function listResourcesMeta() {
  const resources = listResourceConfigs().map((resource) => ({
    key: resource.key,
    label: resource.label,
    idField: resource.idField,
    fields: resource.fields
  }));

  return resources;
}

async function list(resourceKey) {
  const resource = getResourceOrThrow(resourceKey);
  return genericRepository.list(resource);
}

async function getById(resourceKey, rawId) {
  const resource = getResourceOrThrow(resourceKey);
  const id = parseId(rawId);
  const row = await genericRepository.getById(resource, id);
  if (!row) {
    throw new AppError('Record not found', 404);
  }
  return row;
}

async function create(resourceKey, payload) {
  const resource = getResourceOrThrow(resourceKey);
  const normalized = validatePayload(resource, payload, 'create');

  try {
    return await genericRepository.create(resource, normalized);
  } catch (error) {
    mapDatabaseError(error);
  }
}

async function update(resourceKey, rawId, payload) {
  const resource = getResourceOrThrow(resourceKey);
  const id = parseId(rawId);
  const existing = await genericRepository.getById(resource, id);
  if (!existing) {
    throw new AppError('Record not found', 404);
  }

  const normalized = validatePayload(resource, payload, 'update');
  try {
    return await genericRepository.update(resource, id, normalized);
  } catch (error) {
    mapDatabaseError(error);
  }
}

async function remove(resourceKey, rawId) {
  const resource = getResourceOrThrow(resourceKey);
  const id = parseId(rawId);

  try {
    const deleted = await genericRepository.remove(resource, id);
    if (!deleted) {
      throw new AppError('Record not found', 404);
    }
    return true;
  } catch (error) {
    mapDatabaseError(error);
  }
}

module.exports = {
  listResourcesMeta,
  list,
  getById,
  create,
  update,
  remove
};
