const express = require('express');
const router = express.Router();
const {
  createSale,
  getSales,
  getSaleById,
  updateSale,
  deleteSale,
} = require('../controllers/saleController');
const { createRules, updateRules } = require('../validators/saleValidator');
const validate = require('../middlewares/validate');
const auth = require('../middlewares/auth');

// All routes are protected
router.use(auth);

router.get('/', getSales);
router.get('/:id', getSaleById);
router.post('/', validate(createRules), createSale);
router.put('/:id', validate(updateRules), updateSale);
router.delete('/:id', deleteSale);

module.exports = router;
