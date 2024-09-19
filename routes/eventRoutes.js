const express = require('express');
const Event = require('../models/Event');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Create a new event
router.post('/', protect, async (req, res) => {
  const { title, date, time, location, description, imageUrl, category } = req.body;

  if (!title || !date || !time || !location || !description || !category) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const newEvent = new Event({
    title,
    date,
    time,
    location,
    description,
    imageUrl,
    category,
    postedBy: req.user._id, // User who posts the event
  });

  try {
    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all events (optionally filter by category)
router.get('/', async (req, res) => {
  const { category } = req.query; // Category filtering

  try {
    const query = category ? { category } : {};
    const events = await Event.find(query).sort({ date: -1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Register for an event
router.put('/:eventId/register', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    const user = await User.findById(req.user._id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.registeredUsers.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already registered' });
    }

    event.registeredUsers.push(req.user._id);
    user.registeredEvents.push(event._id);
    await event.save();
    await user.save();

    res.status(200).json({ message: 'Registered successfully', event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Unregister from an event
router.put('/:eventId/unregister', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    const user = await User.findById(req.user._id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.registeredUsers = event.registeredUsers.filter(userId => userId.toString() !== req.user._id.toString());
    user.registeredEvents = user.registeredEvents.filter(eventId => eventId.toString() !== event._id.toString());
    await event.save();
    await user.save();

    res.status(200).json({ message: 'Unregistered successfully', event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Endpoint to check if a user is registered for an event
router.get('/:id/is-registered', protect, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id; // User ID from authenticated user

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const isRegistered = event.registeredUsers.includes(userId);
    res.json({ isRegistered });
  } catch (error) {
    console.error('Error checking registration status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;