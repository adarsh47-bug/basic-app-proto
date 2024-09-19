// backend/controllers/jobController.js
const Job = require('../models/Job');

// @desc Add a new job
// @route POST /api/jobs/addjob
// @access Private
const addJob = async (req, res) => {
  try {
    const { title, description, company, location } = req.body;

    const job = new Job({
      user: req.user._id,
      title,
      description,
      company,
      location,
    });

    const createdJob = await job.save();
    res.status(201).json(createdJob);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Get all jobs
// @route GET /api/jobs/
// @access Public
const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({});
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { addJob, getJobs };