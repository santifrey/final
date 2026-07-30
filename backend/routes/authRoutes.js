const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { registerRules, loginRules } = require('../validators/authValidator');
const validate = require('../middlewares/validate');
const { auth } = require('../middlewares/auth');

// Public routes
router.post('/register', validate(registerRules), register);
router.post('/login', validate(loginRules), login);

// Protected routes
router.get('/profile', auth, getProfile);

module.exports = router;
