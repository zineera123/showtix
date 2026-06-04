const express = require('express');
const router = express.Router();
const {
  createBookingOrder,
  verifyPaymentAndCreateBooking,
  getMyBookings,
  getBookings,
} = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, admin, getBookings);
router.route('/order').post(protect, createBookingOrder);
router.route('/verify').post(protect, verifyPaymentAndCreateBooking);
router.route('/mybookings').get(protect, getMyBookings);

module.exports = router;
