const express = require('express');
const router = express.Router();
const { getUsers, getUserById, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { createRules, updateRules } = require('../validators/userValidator');
const validate = require('../middlewares/validate');
const auth = require('../middlewares/auth');
const authorizeRoles = require('../middlewares/roleMiddleware');

// All routes are protected
router.use(auth);

router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', validate(createRules), createUser);
router.put('/:id', validate(updateRules), updateUser);
router.delete('/:id', authorizeRoles('admin'), deleteUser);

module.exports = router;
