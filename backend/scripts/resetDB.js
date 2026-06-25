const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Venue = require('../models/Venue');

const resetDB = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB...');

    // 1. Clear existing data
    console.log('Clearing bookings...');
    await Booking.deleteMany({});
    
    console.log('Clearing events...');
    await Event.deleteMany({});
    
    console.log('Clearing users...');
    await User.deleteMany({});

    console.log('Clearing venues...');
    await Venue.deleteMany({});

    // 2. Seed Default Venues
    const venues = [
      {
        name: 'Grand Symphony Arena',
        location: 'Mumbai, India',
        capacity: 5000,
        description: 'A massive state-of-the-art arena for world-class concerts.',
      },
      {
        name: 'The Royal Theater',
        location: 'Delhi, India',
        capacity: 1200,
        description: 'Classic theater architecture with modern acoustic systems.',
      },
      {
        name: 'Starlight Open Air',
        location: 'Bangalore, India',
        capacity: 3500,
        description: 'A beautiful open-air venue for magical evenings.',
      },
      {
        name: 'Blue Note Jazz Club',
        location: 'Pune, India',
        capacity: 250,
        description: 'Intimate setting for jazz and acoustic performances.',
      }
    ];
    await Venue.insertMany(venues);
    console.log('Sample venues seeded!');

    // 3. Create fresh Admin user
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@showtix.com',
      password: 'Admin@12345',
      role: 'Admin',
      isVerified: true
    });
    console.log('Admin user created successfully!');
    console.log('  Email   : admin@showtix.com');
    console.log('  Password: Admin@12345');

    process.exit(0);
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
};

resetDB();
