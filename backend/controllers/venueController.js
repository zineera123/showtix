const Venue = require('../models/Venue');

// @desc    Get all venues
// @route   GET /api/venues
// @access  Private (Admin & Artist)
const getVenues = async (req, res) => {
  try {
    const venues = await Venue.find({});
    res.json(venues);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a venue
// @route   POST /api/venues
// @access  Private/Admin
const createVenue = async (req, res) => {
  const { name, location, capacity, description } = req.body;

  try {
    const venue = new Venue({
      name,
      location,
      capacity,
      description,
    });

    const createdVenue = await venue.save();
    res.status(201).json(createdVenue);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a venue
// @route   PUT /api/venues/:id
// @access  Private/Admin
const updateVenue = async (req, res) => {
  const { name, location, capacity, description } = req.body;

  try {
    const venue = await Venue.findById(req.params.id);

    if (venue) {
      venue.name = name || venue.name;
      venue.location = location || venue.location;
      venue.capacity = capacity || venue.capacity;
      venue.description = description || venue.description;

      const updatedVenue = await venue.save();
      res.json(updatedVenue);
    } else {
      res.status(404).json({ message: 'Venue not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a venue
// @route   DELETE /api/venues/:id
// @access  Private/Admin
const deleteVenue = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);

    if (venue) {
      await venue.deleteOne();
      res.json({ message: 'Venue removed' });
    } else {
      res.status(404).json({ message: 'Venue not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getVenues,
  createVenue,
  updateVenue,
  deleteVenue,
};
