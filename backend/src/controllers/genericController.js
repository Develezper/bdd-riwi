const genericService = require('../services/genericService');

async function listResourcesMeta(req, res, next) {
  try {
    const data = await genericService.listResourcesMeta();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function list(req, res, next) {
  try {
    const data = await genericService.list(req.params.resource);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const data = await genericService.getById(req.params.resource, req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const data = await genericService.create(req.params.resource, req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const data = await genericService.update(req.params.resource, req.params.id, req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await genericService.remove(req.params.resource, req.params.id);
    res.json({ success: true, message: 'Record deleted successfully' });
  } catch (error) {
    next(error);
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
