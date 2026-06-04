const Event = require('../models/Event');
const Venue = require('../models/Venue');

// @desc    Get all approved events
// @route   GET /api/events
// @access  Public
const getApprovedEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: 'Approved' }).populate('venue');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('venue').populate('artist', 'name');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.status === 'Approved') {
      return res.json(event);
    }

    // Not approved — only allow artist or admin
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
      if (decoded.role === 'Admin' || decoded.id === event.artist._id.toString()) {
        return res.json(event);
      }
    }

    res.status(403).json({ message: 'This event is not yet approved.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Private/Artist
const createEvent = async (req, res) => {
  const { title, description, venue, date, time, price, availableSeats, category } = req.body;

  try {
    const venueExists = await Venue.findById(venue);
    if (!venueExists) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    // CHECK FOR CLASH: Is there an APPROVED event at this venue on this date/time?
    const clash = await Event.findOne({
      venue,
      date,
      time,
      status: 'Approved'
    });

    if (clash) {
      return res.status(400).json({ message: 'Venue is already booked for this date and time slot.' });
    }

    if (availableSeats > venueExists.capacity) {
      return res.status(400).json({ message: `Seats cannot exceed venue capacity (${venueExists.capacity})` });
    }

    const event = new Event({
      title,
      description,
      artist: req.user._id,
      venue,
      date,
      time,
      price,
      availableSeats,
      category: category || 'Music',
      posterUrl: req.file ? req.file.path : '',
    });

    const createdEvent = await event.save();
    res.status(201).json(createdEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get logged in artist's events
// @route   GET /api/events/artist/myevents
// @access  Private/Artist
const getArtistEvents = async (req, res) => {
  try {
    const events = await Event.find({ artist: req.user._id }).populate('venue');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all events (Admin)
// @route   GET /api/events/admin/allevents
// @access  Private/Admin
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({}).populate('venue').populate('artist', 'name');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update event status (Approve/Reject)
// @route   PUT /api/events/:id/status
// @access  Private/Admin
const updateEventStatus = async (req, res) => {
  const { status, reason } = req.body;

  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (status === 'Approved') {
      // Final Clash Check before approval
      const clash = await Event.findOne({
        venue: event.venue,
        date: event.date,
        time: event.time,
        status: 'Approved',
        _id: { $ne: event._id }
      });

      if (clash) {
        return res.status(400).json({ message: 'Cannot approve: Venue is now occupied by another approved event at this time.' });
      }
    }

    event.status = status;
    event.statusReason = reason || '';
    
    const updatedEvent = await (await event.save()).populate('artist', 'name email');
    
    // Send Real Email to Artist
    const { sendEmail } = require('../utils/emailService');
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
        <h2 style="color: ${status === 'Approved' ? '#10b981' : '#e11d48'};">Event Update: ${status}</h2>
        <p>Hello ${updatedEvent.artist.name},</p>
        <p>Your event "<strong>${updatedEvent.title}</strong>" has been <strong>${status.toLowerCase()}</strong> by the Admin.</p>
        ${reason ? `<div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 15px 0;"><strong>Reason:</strong> ${reason}</div>` : ''}
        <p>Please log in to your dashboard to manage your event.</p>
      </div>
    `;

    await sendEmail({
      to: updatedEvent.artist.email,
      subject: `Event Update: ${updatedEvent.title} [${status}]`,
      html: emailHtml
    });

    res.json(updatedEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during status update' });
  }
};

// @desc    Delete event (Artist only, if not approved)
// @route   DELETE /api/events/:id
// @access  Private/Artist
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.artist.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    if (event.status === 'Approved') {
      return res.status(400).json({ message: 'Approved events cannot be deleted. Contact support.' });
    }

    await event.deleteOne();
    res.json({ message: 'Event removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getApprovedEvents,
  getEventById,
  createEvent,
  getArtistEvents,
  getAllEvents,
  updateEventStatus,
  deleteEvent
};
