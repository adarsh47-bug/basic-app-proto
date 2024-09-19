// backend/routes/jobRoutes.js
const express = require('express');
const { addJob, getJobs } = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/addjob').post(protect, addJob);
router.route('/').get(getJobs); // Add this line to fetch all jobs

module.exports = router;