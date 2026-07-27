const { body } = require('express-validator');

const createRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre del producto es obligatorio'),
  body('price')
    .notEmpty()
    .withMessage('El precio es obligatorio')
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número mayor o igual a 0'),
  body('stock')
    .notEmpty()
    .withMessage('El stock es obligatorio')
    .isInt({ min: 0 })
    .withMessage('El stock debe ser un número entero mayor o igual a 0'),
  body('description')
    .optional()
    .trim(),
  body('category')
    .optional()
    .trim(),
];

const updateRules = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El nombre del producto no puede estar vacío'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número mayor o igual a 0'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El stock debe ser un número entero mayor o igual a 0'),
  body('description')
    .optional()
    .trim(),
  body('category')
    .optional()
    .trim(),
];

module.exports = { createRules, updateRules };
