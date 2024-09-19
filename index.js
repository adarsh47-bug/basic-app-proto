const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); // Import the MongoDB connection function
const postRoutes = require('./routes/postRoutes'); // Post-related routes


// Initialize MongoDB connection
connectDB();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/api/message', (req, res) => {
  res.json({ message: 'Hello from the Adarsh Kadam!' });
});

app.use('/api/posts', postRoutes);
// app.use('/api/events', eventRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
