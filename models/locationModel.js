const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  latLongCombined: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  fileNumber: {
    type: String,
    required: true,
  },
  surveyDate: {
    type: Date,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  surveyType: {
    type: String,
    required: true,
    enum: ['1', '2'], // Use enum for validation
  },
});

const Location = mongoose.model('Location', locationSchema);
module.exports = Location;