const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { getLastError, verifySMTP } = require('../utils/emailService');
const config = require('../config/config');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Determine role - default to User if not specified or invalid
    let userRole = 'User';
    if (role === 'Artist' || role === 'Admin') {
      userRole = role;
    }

    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
      isVerified: true,
    });

    if (user) {
      res.status(201).json({
        message: 'Registration successful! You can now log in.',
        email: user.email
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (user.isBlocked) {
        return res.status(403).json({ message: 'Your account has been suspended. Please contact support.' });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Health check & environment validation
// @route   GET /api/auth/health
// @access  Public
const healthCheck = async (req, res) => {
  const smtpStatus = await verifySMTP();
  res.json({
    status: 'ok',
    environment: {
      EMAIL_USER_set: !!process.env.EMAIL_USER,
      EMAIL_PASS_set: !!process.env.EMAIL_PASS,
      FRONTEND_URL_set: !!process.env.FRONTEND_URL,
      JWT_SECRET_set: !!process.env.JWT_SECRET,
      MONGO_URI_set: !!process.env.MONGO_URI,
      FRONTEND_URL: process.env.FRONTEND_URL || 'not_set_falling_back_to_config'
    },
    smtpVerification: smtpStatus,
    lastEmailError: getLastError()
  });
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  healthCheck,
};
