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
const { auth, authorizeRoles } = require('../middlewares/auth');

// All routes require authentication
router.use(auth);

// GET routes are accessible by any authenticated user (admin or customer)
router.get('/', getProducts);
router.get('/:id', getProductById);

// Write routes are protected for admins only
router.post('/', authorizeRoles('admin'), validate(createRules), createProduct);
router.put('/:id', authorizeRoles('admin'), validate(updateRules), updateProduct);
router.delete('/:id', authorizeRoles('admin'), deleteProduct);

module.exports = router;
