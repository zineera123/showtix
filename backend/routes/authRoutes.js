const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  healthCheck,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.get('/health', healthCheck);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.route('/profile').get(protect, getUserProfile);

module.exports = router;

