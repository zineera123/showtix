const User = require('../models/User');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const Venue = require('../models/Venue');

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Toggle block status for a user
// @route   PUT /api/admin/users/:id/block
// @access  Private/Admin
const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'Admin') return res.status(400).json({ message: 'Cannot block an Admin' });

    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'}`, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    const [bookings, events, users, venues] = await Promise.all([
      Booking.find({ paymentStatus: 'Completed' }),
      Event.find({}),
      User.find({ role: 'User' }),
      Venue.find({})
    ]);

    const totalRevenue = bookings.reduce((acc, b) => acc + b.totalPrice, 0);
    const totalBookings = bookings.length;
    const totalUsers = users.length;
    const totalEvents = events.length;

    const approvedEvents = events.filter(e => e.status === 'Approved').length;
    const approvalRate = totalEvents > 0 ? (approvedEvents / totalEvents) * 100 : 0;

    // Venue utilization (rough estimate based on approved event slots)
    // Assuming each venue could ideally have 1 slot per day for 30 days
    const totalPossibleSlots = venues.length * 30; 
    const venueUtilization = totalPossibleSlots > 0 ? (approvedEvents / totalPossibleSlots) * 100 : 0;

    // Repeat customers
    const userBookingCounts = {};
    bookings.forEach(b => {
      userBookingCounts[b.user] = (userBookingCounts[b.user] || 0) + 1;
    });
    const repeatCustomersCount = Object.values(userBookingCounts).filter(count => count > 1).length;
    const repeatCustomerRate = totalUsers > 0 ? (repeatCustomersCount / totalUsers) * 100 : 0;

    res.json({
      totalRevenue,
      totalBookings,
      totalUsers,
      totalEvents,
      approvalRate,
      venueUtilization,
      repeatCustomerRate,
      recentRevenue: bookings.slice(-10).map(b => ({ date: b.createdAt, amount: b.totalPrice }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllUsers,
  toggleBlockUser,
  getAdminStats
};
