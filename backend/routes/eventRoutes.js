const express = require('express');
const router = express.Router();
const {
  getApprovedEvents,
  getEventById,
  createEvent,
  getArtistEvents,
  getAllEvents,
  updateEventStatus,
  deleteEvent,
} = require('../controllers/eventController');
const { protect, artist, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
  .get(getApprovedEvents)
  .post(protect, artist, upload.single('poster'), createEvent);

router.route('/artist/myevents').get(protect, artist, getArtistEvents);
router.route('/admin/allevents').get(protect, admin, getAllEvents);

router.route('/:id').get(getEventById);
router.route('/:id/status').put(protect, admin, updateEventStatus);

module.exports = router;
