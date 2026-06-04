const express = require('express');
const router = express.Router();
const {
  registerUser,
  verifyEmail,
  loginUser,
  getUserProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.get('/verify/:token', verifyEmail);
router.post('/login', loginUser);
router.route('/profile').get(protect, getUserProfile);

module.exports = router;
