const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  venue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  posterUrl: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  category: {
    type: String,
    enum: ['Music', 'Comedy', 'Workshop', 'Arts', 'Tech', 'Other'],
    default: 'Music',
  },
  availableSeats: {
    type: Number,
    required: true,
  },
  statusReason: {
    type: String,
    default: '',
  },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
