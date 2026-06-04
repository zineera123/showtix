const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Venue = require('../models/Venue');
const connectDB = require('../config/db');

const seedVenues = async () => {
  await connectDB();

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

  try {
    await Venue.deleteMany(); // Clear existing
    await Venue.insertMany(venues);
    console.log('Sample venues seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding venues:', error);
    process.exit(1);
  }
};

seedVenues();
