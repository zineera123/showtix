const Booking = require('../models/Booking');
const Event = require('../models/Event');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { sendBookingEmail } = require('../utils/emailService');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Step 1: Create Razorpay Order
// @route   POST /api/bookings/order
// @access  Private/User
const createBookingOrder = async (req, res) => {
  const { eventId, seatsBooked } = req.body;

  try {
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.status !== 'Approved') {
      return res.status(400).json({ message: 'Event is not approved for booking' });
    }

    if (event.availableSeats < seatsBooked) {
      return res.status(400).json({ message: 'Not enough seats available' });
    }

    const amount = event.price * seatsBooked * 100; // In paise

    const options = {
      amount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(201).json({
      key: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      event: {
        title: event.title,
        price: event.price
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create payment order' });
  }
};

// @desc    Step 2: Verify Payment & Confirm Booking
// @route   POST /api/bookings/verify
// @access  Private/User
const verifyPaymentAndCreateBooking = async (req, res) => {
  const { 
    razorpay_order_id, 
    razorpay_payment_id, 
    razorpay_signature,
    eventId,
    seatsBooked
  } = req.body;

  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(sign.toString())
    .digest("hex");

  if (razorpay_signature !== expectedSign) {
    return res.status(400).json({ message: 'Invalid payment signature' });
  }

  // Payment verified, now create booking in transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const event = await Event.findById(eventId).session(session);

    if (event.availableSeats < seatsBooked) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Seats sold out during payment process' });
    }

    // Deduct seats
    event.availableSeats -= seatsBooked;
    await event.save({ session });

    const totalPrice = event.price * seatsBooked;

    const booking = new Booking({
      user: req.user._id,
      event: event._id,
      seatsBooked,
      totalPrice,
      paymentStatus: 'Completed',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature
    });

    const createdBooking = await booking.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Send Real Email
    await sendBookingEmail(req.user.email, req.user.name, createdBooking, event);

    res.status(201).json({
      message: 'Booking confirmed',
      bookingId: createdBooking._id
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    res.status(500).json({ message: 'Booking confirmation failed' });
  }
};

// @desc    Get logged in user's bookings
// @route   GET /api/bookings/mybookings
// @access  Private
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate({
      path: 'event',
      populate: { path: 'venue' },
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Private/Admin
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({}).populate('user', 'id name email').populate({
      path: 'event',
      populate: { path: 'venue' },
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createBookingOrder,
  verifyPaymentAndCreateBooking,
  getMyBookings,
  getBookings,
};
