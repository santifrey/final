const { check } = require('express-validator');

const createRules = [
  check('name', 'El nombre es obligatorio').not().isEmpty(),
  check('email', 'Por favor incluya un email válido').isEmail(),
  check('password', 'La contraseña debe tener al menos 6 caracteres').isLength({
    min: 6,
  }),
];

const updateRules = [
  check('name', 'El nombre no puede estar vacío').optional().not().isEmpty(),
  check('email', 'Por favor incluya un email válido').optional().isEmail(),
  check('password', 'La contraseña debe tener al menos 6 caracteres').optional().isLength({
    min: 6,
  }),
];

module.exports = {
  createRules,
  updateRules,
};
