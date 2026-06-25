/**
 * One-time migration script: Mark all existing unverified users as verified
 * and remove any leftover verification tokens.
 *
 * Usage:  node backend/scripts/migrateVerifiedUsers.js
 *
 * Safe to run multiple times — it only updates users where isVerified !== true.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    const result = await User.updateMany(
      { isVerified: { $ne: true } },
      { $set: { isVerified: true }, $unset: { verificationToken: 1 } }
    );

    console.log(`Migration complete — ${result.modifiedCount} user(s) updated to isVerified: true.`);

    // Also clean up leftover verificationToken fields on already-verified users
    const tokenCleanup = await User.updateMany(
      { verificationToken: { $exists: true } },
      { $unset: { verificationToken: 1 } }
    );

    if (tokenCleanup.modifiedCount > 0) {
      console.log(`Cleaned up verificationToken from ${tokenCleanup.modifiedCount} additional user(s).`);
    }

    await mongoose.disconnect();
    console.log('Disconnected. Migration finished successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
};

migrate();
