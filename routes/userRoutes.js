const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/requireAdmin');

router.post('/', authMiddleware, requireAdmin, userController.createUser);
router.get('/', authMiddleware, requireAdmin, userController.getAllUsers);
router.delete('/:id', authMiddleware, requireAdmin, userController.deleteUser);
router.put('/change-password', authMiddleware, requireAdmin, userController.changeOwnPassword);
router.put('/:id/change-password', authMiddleware, requireAdmin, userController.changeUserPassword);

module.exports = router;