const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../utils/emailService');
const config = require('../config/config');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      if (userExists.isVerified) {
        return res.status(400).json({ message: 'User already exists' });
      } else {
        // User exists but is unverified - update their details and send a new token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        userExists.name = name || userExists.name;
        if (password) {
          userExists.password = password; // mongoose schema pre-save hook will hash this
        }
        if (role === 'Artist' || role === 'Admin' || role === 'User') {
          userExists.role = role;
        }
        userExists.verificationToken = verificationToken;
        await userExists.save();

        // Send new verification email asynchronously
        sendVerificationEmail(userExists.email, userExists.name, verificationToken)
          .catch(err => console.error('Email verification dispatch failed:', err));

        return res.status(201).json({
          message: 'Registration updated! A fresh verification email has been sent to your inbox.',
          email: userExists.email
        });
      }
    }

    // Determine role - default to User if not specified or invalid
    let userRole = 'User';
    if (role === 'Artist' || role === 'Admin') {
      userRole = role;
    }

    // Generate Verification Token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
      verificationToken,
      isVerified: false,
    });

    if (user) {
      // Send real email asynchronously
      sendVerificationEmail(user.email, user.name, verificationToken)
        .catch(err => console.error('Email verification dispatch failed:', err));

      res.status(201).json({
        message: 'Registration successful! Please check your email to verify your account.',
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

// @desc    Verify email
// @route   GET /api/auth/verify/:token
// @access  Public
const verifyEmail = async (req, res) => {
  const { token } = req.params;
  console.log('--- Email Verification Start (Atomic) ---');
  console.log('Verification Token Received:', token);

  try {
    // Perform an atomic update: Find by token, set verified to true, and clear token
    const user = await User.findOneAndUpdate(
      { verificationToken: token },
      { 
        $set: { isVerified: true },
        $unset: { verificationToken: 1 } 
      },
      { new: true } // Return the updated document
    );

    if (!user) {
      console.log('Verification Failed: No user found with this token (or already verified)');
      // Check if user is already verified (by searching for a user that HAS no token but was likely the one we want)
      // Since we don't have email here, we can't be sure, but let's assume if findOne fails, it's either bad token or already done.
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    console.log('User Verified Atomically:', user.email);
    res.json({ message: 'Email verified successfully! You can now log in.' });

  } catch (error) {
    console.error('Verification Atomic Error:', error);
    res.status(500).json({ message: 'An error occurred during verification' });
  } finally {
    console.log('--- Email Verification End ---');
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
      // Check if verified
      if (!user.isVerified) {
        return res.status(403).json({ 
          message: 'Please verify your email address before logging in.',
          unverified: true 
        });
      }

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

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
const resendVerification = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: 'This account is already verified. Please log in.' });
    }

    // Generate new token and save
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    await user.save();

    await sendVerificationEmail(user.email, user.name, verificationToken);

    res.json({ message: 'Verification email resent successfully! Please check your inbox.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while resending verification email' });
  }
};

// @desc    Health check & environment validation
// @route   GET /api/auth/health
// @access  Public
const healthCheck = async (req, res) => {
  res.json({
    status: 'ok',
    environment: {
      EMAIL_USER_set: !!process.env.EMAIL_USER,
      EMAIL_PASS_set: !!process.env.EMAIL_PASS,
      FRONTEND_URL_set: !!process.env.FRONTEND_URL,
      JWT_SECRET_set: !!process.env.JWT_SECRET,
      MONGO_URI_set: !!process.env.MONGO_URI,
      FRONTEND_URL: process.env.FRONTEND_URL || 'not_set_falling_back_to_config'
    }
  });
};

module.exports = {
  registerUser,
  verifyEmail,
  loginUser,
  getUserProfile,
  resendVerification,
  healthCheck,
};
