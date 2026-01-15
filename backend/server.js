const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes.js');
const taskRoutes = require('./routes/taskRoutes.js');
const userProfileRoutes = require('./routes/userProfileRoutes.js');
const gamificationRoutes = require('./routes/gamificationRoutes.js');
const progressRoutes = require('./routes/progressRoutes');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

if (!process.env.MONGO_URI) {
  console.error('Missing MONGO_URI in environment. Create backend/.env with MONGO_URI=your-connection-string');
  process.exit(1);
}
const PORT = process.env.PORT || 5001;

const app = express();

// Middleware - Configure CORS properly
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/user-profile', userProfileRoutes);
app.use('/api/gamification', require('./routes/gamificationRoutes'));

app.use('/api/progress', progressRoutes);

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// MongoDB Connection (async)
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    console.log("Server is running but database operations will fail until MongoDB is connected");
  });
