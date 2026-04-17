import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db.js';
import schoolRoutes from './routes/schoolRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', schoolRoutes);

// Basic health check route
app.get('/', (req, res) => {
  try {
    res.status(200).send('API is running successfully');
  } catch (error) {
    console.error('Error in health check route:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Define PORT (default 5000)
const PORT = process.env.PORT || 5000;

// Test DB Connection and Start Server
const startServer = async () => {
  try {
    // Test DB connection on server start
    const connection = await pool.getConnection();
    console.log('Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }

  // Start server
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
