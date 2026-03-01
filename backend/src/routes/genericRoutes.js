const express = require('express');
const {
  listResourcesMeta,
  list,
  getById,
  create,
  update,
  remove
} = require('../controllers/genericController');

const router = express.Router();

router.get('/meta/resources', listResourcesMeta);
router.get('/generic/:resource', list);
router.get('/generic/:resource/:id', getById);
router.post('/generic/:resource', create);
router.put('/generic/:resource/:id', update);
router.delete('/generic/:resource/:id', remove);

module.exports = router;
