const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const checkArtist = async () => {
  try {
    await connectDB();
    const user = await User.findOne({ email: 'artist@showtix.com' });
    if (user) {
      console.log(`FOUND_ARTIST`);
      console.log(`Verified: ${user.isVerified}`);
      console.log(`Token: ${user.verificationToken}`);
    } else {
      console.log('NO_ARTIST_FOUND');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkArtist();
