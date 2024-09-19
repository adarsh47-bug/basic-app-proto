// routes/userRoutes.js
const express = require('express');
const {
  registerUser,
  authUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
  // getAllAlumni,
  getAllUsers,
  // connectUser,
  sendConnectionRequest,
  acceptConnectionRequest,
  cancelConnectionRequest,
  getConnectionRequests,
  declineConnectionRequest,
  getUserProfileById,
  getUserConnections,
  getAlumniUsers,
  getStudentsUsers,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();
const User = require('../models/User');

router.route('/').post(registerUser); // Register new user
router.post('/login', authUser); // User login
router.post('/logout', logoutUser); // User logout

// User profile management
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.route('/profile/password').put(protect, updateUserPassword);

// Fetch all alumni
// router.route('/alumni').get(protect, getAllAlumni);

// Fetch all users, alumni, students
router.route('/explore-connect').get(protect, getAllUsers);
router.route('/alumni-connect').get(protect, getAlumniUsers);
router.route('/students-connect').get(protect, getStudentsUsers);

// router.route('/connect/:id').put(protect, connectUser);

// Connection requests
router.route('/connect/request/:id').put(protect, sendConnectionRequest);
router.route('/connect/accept/:id').put(protect, acceptConnectionRequest);
router.route('/connect/cancel/:id').put(protect, cancelConnectionRequest);
router.route('/connect/decline/:id').put(protect, declineConnectionRequest);

// Fetch user profile by ID
router.route('/profile/:id').get(getUserProfileById);
// router.route('/profile/:id').get(protect, getUserProfileById);


// Fetch connection data
router.route('/connections').get(protect, getConnectionRequests);

//get connections only
router.route('/connections-list/:userId').get(protect, getUserConnections);

// Fetch registered events for the user
router.route('/registered-events').get(protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('registeredEvents');
    res.status(200).json(user.registeredEvents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
