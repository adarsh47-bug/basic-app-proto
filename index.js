const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // Import the MongoDB connection function

const userRoutes = require('./routes/userRoutes'); // User-related routes
const jobRoutes = require('./routes/jobRoutes'); // Job-related routes
const postRoutes = require('./routes/postRoutes'); // Post-related routes
const conversationRoutes = require('./routes/conversationsRoutes'); // Conversation routes (chat)
const messageRoutes = require('./routes/messagesRoutes'); // Message routes (chat messages)
const eventRoutes = require('./routes/eventRoutes'); // Event-related routes
const { notFound, errorHandler } = require('./middleware/errorMiddleware'); // Custom error handlers
const cors = require('cors');

// Load environment variables
dotenv.config();

// Initialize MongoDB connection
connectDB();

const app = express();

// Built-in body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/api/message', (req, res) => {
  res.json({ message: 'Hello from the Adarsh Kadam!' });
});

// Mounting API routes
app.use('/api/users', userRoutes); // Handles user-related API requests
app.use('/api/jobs', jobRoutes); // Handles job-related API requests
app.use('/api/conversations', conversationRoutes); // Handles chat conversations
app.use('/api/messages', messageRoutes); // Handles chat messages
app.use('/api/posts', postRoutes); // Handles post-related API requests
app.use('/api/events', eventRoutes); // Handles event-related API requests

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
