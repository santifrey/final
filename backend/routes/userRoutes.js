const express = require('express');
const router = express.Router();
const { getUsers, getUserById, deleteUser } = require('../controllers/userController');
const { auth, authorizeRoles } = require('../middlewares/auth');

// All routes are protected and admin only
router.use(auth);
router.use(authorizeRoles('admin'));

router.get('/', getUsers);
router.get('/:id', getUserById);
router.delete('/:id', deleteUser);

module.exports = router;
