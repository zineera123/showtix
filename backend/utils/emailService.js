const nodemailer = require('nodemailer');
const config = require('../config/config');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

let lastEmailError = null;

const getLastError = () => lastEmailError;

const sendEmail = async (options) => {
  const mailOptions = {
    from: `"ShowTix" <${process.env.EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to: ${options.to}`);
  } catch (error) {
    console.error('Email send failed:', error);
    lastEmailError = {
      message: error.message,
      code: error.code,
      command: error.command,
      timestamp: new Date().toISOString()
    };
    throw error;
  }
};

// Specialized Templates
const sendVerificationEmail = async (email, name, token) => {
  const baseUrl = config.frontendUrl.replace(/\/$/, '');
  const verifyUrl = `${baseUrl}/verify-email?token=${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #e11d48; text-align: center;">Welcome to ShowTix!</h2>
      <p>Hello ${name},</p>
      <p>Please verify your email address to activate your account and start booking live experiences.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyUrl}" style="background-color: #e11d48; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify My Email</a>
      </div>
      <p>If the button doesn't work, copy and paste this link:</p>
      <p style="color: #666; font-size: 12px;">${verifyUrl}</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 10px; color: #aaa; text-align: center;">&copy; 2026 ShowTix Ecosystem. All rights reserved.</p>
    </div>
  `;

  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  await sendEmail({ to: email, subject: `Verify Your ShowTix Account - ${timestamp}`, html });
};

const sendBookingEmail = async (email, name, booking, event) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="color: #e11d48; font-size: 24px; font-weight: bold;">ShowTix Pass</span>
      </div>
      <h3 style="margin-top: 0;">Confirmed: ${event.title}</h3>
      <p>Hello ${name}, your booking is confirmed! Here is your access pass details:</p>
      <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
         <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Date</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${new Date(event.date).toLocaleDateString()}</td></tr>
         <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Time</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${event.time}</td></tr>
         <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Seats</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${booking.seatsBooked}</td></tr>
         <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Price</td><td style="padding: 10px; border-bottom: 1px solid #eee;">₹${booking.totalPrice}</td></tr>
         <tr><td style="padding: 10px; font-weight: bold;">Booking ID</td><td style="padding: 10px;">${booking._id}</td></tr>
      </table>
      <div style="background: #f9fafb; padding: 20px; text-align: center; border-radius: 20px; border: 1px dashed #ddd;">
         <p style="font-size: 12px; color: #666;">Present the QR code in your dashboard for venue entry.</p>
      </div>
    </div>
  `;

  await sendEmail({ to: email, subject: `Ticket Confirmation: ${event.title}`, html });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendBookingEmail,
  getLastError,
};
