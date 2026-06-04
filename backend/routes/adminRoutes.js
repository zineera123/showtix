const express = require('express');
const router = express.Router();
const { getAllUsers, toggleBlockUser, getAdminStats } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/users').get(protect, admin, getAllUsers);
router.route('/users/:id/block').put(protect, admin, toggleBlockUser);
router.route('/stats').get(protect, admin, getAdminStats);

module.exports = router;
