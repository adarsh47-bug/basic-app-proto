// controllers/userController.js
const { mongoose } = require('mongoose');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');

// @desc Register a new user
// @route POST /api/users
// @access Public
const registerUser = async (req, res) => {
  const { name, email, password, type, accessCode } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      type,
      accessCode,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        type: user.type,
        accessCode: user.accessCode,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc Authenticate user & get token
// @route POST /api/users/login
// @access Public
const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Logout user
// @route POST /api/users/logout
// @access Public
const logoutUser = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc Get user profile
// @route GET /api/users/profile
// @access Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Update user profile
// @route PUT /api/users/profile
// @access Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.contactNumber = req.body.contactNumber || user.contactNumber;
      user.bio = req.body.bio || user.bio;

      // Update education
      if (req.body.education) {
        req.body.education.forEach((edu, index) => {
          if (user.education[index]) {
            user.education[index].degree = edu.degree || user.education[index].degree;
            user.education[index].institution = edu.institution || user.education[index].institution;
            user.education[index].year = edu.year || user.education[index].year;
            user.education[index].description = edu.description || user.education[index].description;
            user.education[index].images = edu.images || user.education[index].images;
          } else {
            user.education.push(edu);
          }
        });
      }

      // Similarly handle other array fields like experience
      if (req.body.experience) {
        req.body.experience.forEach((exp, index) => {
          if (user.experience[index]) {
            user.experience[index].position = exp.position || user.experience[index].position;
            user.experience[index].company = exp.company || user.experience[index].company;
            user.experience[index].startDate = exp.startDate || user.experience[index].startDate;
            user.experience[index].endDate = exp.endDate || user.experience[index].endDate;
            user.experience[index].description = exp.description || user.experience[index].description;
          } else {
            user.experience.push(exp);
          }
        });
      }

      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Update user password
// @route PUT /api/users/profile/password
// @access Private
const updateUserPassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user && (await user.matchPassword(req.body.currentPassword))) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.newPassword, salt);
      await user.save();
      res.json({ message: 'Password updated successfully' });
    } else {
      res.status(400).json({ message: 'Current password is incorrect' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getExcludedUserIds = async (req) => {
  try {
    // Fetch the current user
    const currentUser = await User.findById(req.user._id)
      .select('connections connectionRequests connectionRequestsSent');

    if (!currentUser) {
      return [];
    }

    // Get the IDs of users to exclude (connections, connection requests, and sent requests)
    return [
      ...currentUser.connections,
      ...currentUser.connectionRequests,
      ...currentUser.connectionRequestsSent,
      req.user._id // Exclude the current user as well
    ];
  } catch (error) {
    console.error(error);
    return [];
  }
};

// @desc Get all users except connections, connection requests, and connection requests sent
// @route GET /api/users/explore-connect
// @access Private
const getAllUsers = async (req, res) => {
  try {
    // // Fetch the current user
    // const currentUser = await User.findById(req.user._id)
    //   .select('connections connectionRequests connectionRequestsSent');

    // if (!currentUser) {
    //   return res.status(404).json({ message: 'User not found' });
    // }

    // // Log the current user details
    // // console.log('Current User:', currentUser);

    // // Get the IDs of users to exclude (connections, connection requests, and sent requests)
    // const excludedUserIds = [
    //   ...currentUser.connections,
    //   ...currentUser.connectionRequests,
    //   ...currentUser.connectionRequestsSent,
    //   req.user._id // Exclude the current user as well
    // ];

    // Log the excluded user IDs
    // console.log('Excluded User IDs:', excludedUserIds);

    // Find all users except those in the excludedUserIds list and exclude the password field
    const users = await User.find({
      _id: { $nin: await getExcludedUserIds(req) }
    }).select('-password');

    // Log the found users
    // console.log('Found Users:', users);

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Get all alumni users
// @route GET /api/users/alumni-connect
// @access Private
const getAlumniUsers = async (req, res) => {
  try {
    const alumniUsers = await User.find({ _id: { $nin: await getExcludedUserIds(req) }, type: "Alumni" }).select('-password');
    res.json(alumniUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Get all student users
// @route GET /api/users/students-connect
// @access Private
const getStudentsUsers = async (req, res) => {
  try {
    const studentUsers = await User.find({ _id: { $nin: await getExcludedUserIds(req) }, type: "Student" }).select('-password');
    res.json(studentUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Connect with a user
// @route PUT /api/users/connect/:id
// @access Private
// const connectUser = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);
//     const connectUser = await User.findById(req.params.id);

//     if (user && connectUser) {
//       if (!user.connections.includes(connectUser._id)) {
//         user.connections.push(connectUser._id);
//         await user.save();
//         res.status(200).json({ message: 'User connected successfully' });
//       } else {
//         res.status(400).json({ message: 'User already connected' });
//       }
//     } else {
//       res.status(404).json({ message: 'User not found' });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// @desc Send connection request
// @route PUT /api/users/connect/request/:id
// @access Private
const sendConnectionRequest = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const targetUser = await User.findById(req.params.id);

    if (user && targetUser) {
      if (!user.connectionRequestsSent.includes(targetUser._id)) {
        user.connectionRequestsSent.push(targetUser._id);
        targetUser.connectionRequests.push(user._id);
        await user.save();
        await targetUser.save();
        res.status(200).json({ message: 'Connection request sent successfully' });
      } else {
        res.status(400).json({ message: 'Connection request already sent' });
      }
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Accept connection request
// @route PUT /api/users/connect/accept/:id
// @access Private
const acceptConnectionRequest = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const targetUser = await User.findById(req.params.id);

    if (user && targetUser) {
      if (user.connectionRequests.includes(targetUser._id)) {
        user.connections.push(targetUser._id);
        targetUser.connections.push(user._id);

        user.connectionRequests = user.connectionRequests.filter(
          (id) => id.toString() !== targetUser._id.toString()
        );
        targetUser.connectionRequestsSent = targetUser.connectionRequestsSent.filter(
          (id) => id.toString() !== user._id.toString()
        );

        await user.save();
        await targetUser.save();
        res.status(200).json({ message: 'Connection request accepted successfully' });
      } else {
        res.status(400).json({ message: 'No connection request found' });
      }
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Cancel connection request
// @route PUT /api/users/connect/cancel/:id
// @access Private
const cancelConnectionRequest = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const targetUser = await User.findById(req.params.id);

    if (user && targetUser) {
      if (user.connectionRequestsSent.includes(targetUser._id)) {
        user.connectionRequestsSent = user.connectionRequestsSent.filter(
          (id) => id.toString() !== targetUser._id.toString()
        );
        targetUser.connectionRequests = targetUser.connectionRequests.filter(
          (id) => id.toString() !== user._id.toString()
        );

        await user.save();
        await targetUser.save();
        res.status(200).json({ message: 'Connection request canceled successfully' });
      } else {
        res.status(400).json({ message: 'No connection request found' });
      }
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Decline connection request
// @route PUT /api/users/connect/decline/:id
// @access Private
const declineConnectionRequest = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const targetUser = await User.findById(req.params.id);

    if (user && targetUser) {
      if (user.connectionRequests.includes(targetUser._id)) {
        user.connectionRequests = user.connectionRequests.filter(
          (id) => id.toString() !== targetUser._id.toString()
        );
        targetUser.connectionRequestsSent = targetUser.connectionRequestsSent.filter(
          (id) => id.toString() !== user._id.toString()
        );

        await user.save();
        await targetUser.save();
        res.status(200).json({ message: 'Connection request declined successfully' });
      } else {
        res.status(400).json({ message: 'No connection request found' });
      }
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// @desc Get full profiles of connection requests sent and received
// @route GET /api/users/connections
// @access Private
const getConnectionRequests = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id)
      .select('connections connectionRequests connectionRequestsSent');

    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const connections = await User.find({
      _id: { $in: currentUser.connections }
    }).select('-password');

    const connectionRequestsReceived = await User.find({
      _id: { $in: currentUser.connectionRequests }
    }).select('-password');

    const connectionRequestsSent = await User.find({
      _id: { $in: currentUser.connectionRequestsSent }
    }).select('-password');

    res.status(200).json({ connections, connectionRequestsReceived, connectionRequestsSent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Get user profile by ID
// @route GET /api/users/:id
// @access Public
const getUserProfileById = async (req, res) => {
  const userId = req.params.id;

  // Validate the userId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc Get user connections
// @route GET /api/users/:userId/friends
// @access Private
const getUserConnections = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const connections = await Promise.all(
      user.connections.map((friendId) => User.findById(friendId))
    );

    const connectionList = connections.map(({ _id, name, profileImg }) => ({
      _id,
      name,
      profileImg,
    }));

    res.status(200).json(connectionList);
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = {
  registerUser,
  authUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
  // getAllAlumni,
  getAllUsers,
  getAlumniUsers,
  getStudentsUsers,
  // connectUser,
  sendConnectionRequest,
  acceptConnectionRequest,
  cancelConnectionRequest,
  declineConnectionRequest,
  getConnectionRequests,
  getUserProfileById,
  getUserConnections,
};
