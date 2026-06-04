const express = require('express');
const router = express.Router();
const {
  getVenues,
  createVenue,
  updateVenue,
  deleteVenue,
} = require('../controllers/venueController');
const { protect, admin, artist } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(protect, artist, getVenues)
  .post(protect, admin, createVenue);

router
  .route('/:id')
  .put(protect, admin, updateVenue)
  .delete(protect, admin, deleteVenue);

module.exports = router;
