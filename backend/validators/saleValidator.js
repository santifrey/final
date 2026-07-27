const { body } = require('express-validator');

const createRules = [
  body('user')
    .notEmpty()
    .withMessage('El usuario es obligatorio')
    .isMongoId()
    .withMessage('El ID del usuario no es válido'),
  body('product')
    .notEmpty()
    .withMessage('El producto es obligatorio')
    .isMongoId()
    .withMessage('El ID del producto no es válido'),
  body('quantity')
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
  body('product')
    .optional()
    .isMongoId()
    .withMessage('El ID del producto no es válido'),
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La cantidad debe ser un número entero mayor o igual a 1'),
];

module.exports = { createRules, updateRules };
