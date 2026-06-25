const express = require('express');
const router = express.Router();
const {
  registerUser,
  verifyEmail,
  loginUser,
  getUserProfile,
  resendVerification,
  healthCheck,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.get('/health', healthCheck);
router.post('/resend-verification', resendVerification);
router.post('/register', registerUser);
router.get('/verify/:token', verifyEmail);
router.post('/login', loginUser);
router.route('/profile').get(protect, getUserProfile);

module.exports = router;
