// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define schema for Education and Experience
const educationSchema = mongoose.Schema({
  degree: { type: String },
  University: { type: String },
  institution: { type: String },
  year: { type: Number },
  description: { type: String },
  images: [{ type: String }],
});

const experienceSchema = mongoose.Schema({
  position: { type: String },
  company: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  description: { type: String },
});

// Main User schema
const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    contactNumber: { type: String },
    bio: { type: String },
    type: {
      type: String,
      enum: ['Alumni', 'Student', 'Admin'],
      default: 'Student',
    },
    accessCode: { type: String, default: '' },
    profileImg: { type: String, default: 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?w=740&t=st=1725699415~exp=1725700015~hmac=04feb55fd8848c29e1fd50fe7f67686ef34ea6bf5b89e8a9d2a8ce02688f1173' },
    analytics: { type: mongoose.Schema.Types.Mixed }, // For flexibility in analytics structure
    progressTracking: { type: mongoose.Schema.Types.Mixed },
    education: [educationSchema],
    experience: [experienceSchema],
    skills: [{ type: String }],
    areasOfInterest: [{ type: String }],
    projects: [{ type: String }],
    courses: [{ type: String }],
    certifications: [{ type: String }],
    volunteerExperience: [{ type: String }],
    honorsAwards: [{ type: String }],
    languages: [{ type: String }],
    organizations: [{ type: String }],
    contactInformation: { type: String },
    myFeeds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Feed' }],
    bookmarkedFeeds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Feed' }],
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    connectionRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    connectionRequestsSent: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
    registeredEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
    eventsPosted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
    universityName: { type: String },
    jobsApplied: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
    jobsCreated: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
    coursesPurchased: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    coursesPublished: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

// Hash password before saving user
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
