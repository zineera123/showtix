const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');

const createAdmin = async () => {
  await connectDB();

  const existingAdmin = await User.findOne({ email: 'admin@showtix.com' });
  if (existingAdmin) {
    console.log('Admin user already exists: admin@showtix.com');
    process.exit(0);
  }

  const admin = await User.create({
    name: 'Super Admin',
    email: 'admin@showtix.com',
    password: 'Admin@12345',
    role: 'Admin',
  });

  console.log('Admin user created!');
  console.log('  Email   : admin@showtix.com');
  console.log('  Password: Admin@12345');
  process.exit(0);
};

createAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
