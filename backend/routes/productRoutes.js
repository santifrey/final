const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { createRules, updateRules } = require('../validators/productValidator');
const validate = require('../middlewares/validate');
const auth = require('../middlewares/auth');

// All routes are protected
router.use(auth);

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', validate(createRules), createProduct);
router.put('/:id', validate(updateRules), updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
