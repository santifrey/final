const express = require('express');
const router = express.Router();
const {
  createSale,
  getSales,
  getSaleById,
  deleteSale,
} = require('../controllers/saleController');
const { createRules } = require('../validators/saleValidator');
const validate = require('../middlewares/validate');
const { auth, authorizeRoles } = require('../middlewares/auth');

// All routes are protected
router.use(auth);

router.get('/', getSales);
router.get('/:id', getSaleById);
router.post('/', validate(createRules), createSale);
router.delete('/:id', authorizeRoles('admin'), deleteSale);

module.exports = router;
