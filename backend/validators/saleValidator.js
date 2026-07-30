const { body } = require('express-validator');

const createRules = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('El carrito debe contener al menos un producto'),
  body('items.*.product')
    .notEmpty()
    .withMessage('El ID del producto es obligatorio')
    .isMongoId()
    .withMessage('El ID del producto no es válido'),
  body('items.*.quantity')
    .notEmpty()
    .withMessage('La cantidad es obligatoria')
    .isInt({ min: 1 })
    .withMessage('La cantidad debe ser un número entero mayor o igual a 1'),
];

module.exports = { createRules };
