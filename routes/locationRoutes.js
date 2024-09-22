const express = require('express');
const { getAllLocations, addLocation } = require('../controllers/locationController');
const router = express.Router();

// Get all locations
router.get('/', getAllLocations);

// Add a new location
router.post('/', addLocation);

module.exports = router;
