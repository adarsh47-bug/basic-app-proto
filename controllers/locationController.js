const Location = require('../models/locationModel');

// Get all locations
exports.getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find({});
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Add a new location
exports.addLocation = async (req, res) => {
  try {
    const { latitude, longitude, address, fileNumber, surveyDate, category } = req.body;
    const newLocation = new Location({ latitude, longitude, address, fileNumber, surveyDate, category });
    await newLocation.save();
    res.status(201).json(newLocation);
  } catch (error) {
    res.status(400).json({ message: 'Invalid location data', error });
  }
};
