const { body } = require('express-validator');

const createRules = [
  body('user')
    .notEmpty()
    .withMessage('El usuario es obligatorio')
    .isMongoId()
    .withMessage('El ID del usuario no es válido'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('La venta debe tener al menos un producto'),
  body('items.*.product')
    .notEmpty()
    .withMessage('El producto es obligatorio')
    .isMongoId()
    .withMessage('El ID del producto no es válido'),
  body('items.*.quantity')
    .notEmpty()
    .withMessage('La cantidad es obligatoria')
    .isInt({ min: 1 })
    .withMessage('La cantidad debe ser un número entero mayor o igual a 1'),
];

const updateRules = [
  body('user')
    .optional()
    .isMongoId()
    .withMessage('El ID del usuario no es válido'),
  body('items')
    .optional()
    .isArray({ min: 1 })
    .withMessage('La venta debe tener al menos un producto'),
  body('items.*.product')
    .optional()
    .isMongoId()
    .withMessage('El ID del producto no es válido'),
  body('items.*.quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La cantidad debe ser un número entero mayor o igual a 1'),
];

module.exports = { createRules, updateRules };
