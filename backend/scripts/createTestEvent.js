const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Event = require('../models/Event');
const Venue = require('../models/Venue');

const createTestEvent = async () => {
  try {
    await connectDB();

    // 1. Delete existing test artist if present
    await User.deleteOne({ email: 'artist@showtix.com' });
    await Event.deleteMany({ title: 'Acoustic Rock Night' });

    // 2. Create verified Artist user
    const artist = await User.create({
      name: 'Jon Bon Jovi',
      email: 'artist@showtix.com',
      password: 'Password@123',
      role: 'Artist',
      isVerified: true
    });
    console.log('Artist created successfully!');

    // 3. Find the first venue
    const venue = await Venue.findOne({});
    if (!venue) {
      console.error('No venues found! Please run resetDB.js first.');
      process.exit(1);
    }
    console.log(`Found Venue: ${venue.name}`);

    // 4. Create pending event request
    const event = await Event.create({
      title: 'Acoustic Rock Night',
      description: 'An intimate evening of classic acoustic hits and stories.',
      artist: artist._id,
      venue: venue._id,
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      time: '20:00',
      price: 1500,
      availableSeats: 250,
      category: 'Music',
      status: 'Pending'
    });
    console.log(`Created Pending Event Request: "${event.title}"`);

    process.exit(0);
  } catch (error) {
    console.error('Error creating test event:', error);
    process.exit(1);
  }
};

createTestEvent();
