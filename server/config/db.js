/**
 * Database Configuration
 *
 * Establishes connection to MongoDB database for storing:
 * - User accounts and authentication data
 * - Sensor data (temperature, TDS, GPS coordinates)
 * - Historical mission data
 *
 * @module config/db
 */

const mongoose = require('mongoose');

/**
 * Connects to MongoDB database
 *
 * @async
 * @returns {Promise<void>}
 * @throws {Error} If connection fails
 */
const ConnectionDb = async () => {
  try {
    // Use environment variable or fallback to local development database
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/submarineDB';

    // Connection options for better performance and reliability
    const options = {
      // Use new URL parser
      // Automatically reconnect on connection loss
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    };

    await mongoose.connect(mongoURI, options);

    console.log('[Database] MongoDB connected successfully');
    console.log(`[Database] Connected to: ${mongoose.connection.name}`);

  } catch (error) {
    console.error('[Database] Connection failed:', error.message);
    console.error('[Database] Please ensure MongoDB is running');

    // Exit process with failure code in production
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

/**
 * Mongoose connection event handlers
 */
mongoose.connection.on('disconnected', () => {
  console.warn('[Database] MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('[Database] MongoDB error:', err.message);
});

mongoose.connection.on('reconnected', () => {
  console.log('[Database] MongoDB reconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('[Database] MongoDB connection closed through app termination');
  process.exit(0);
});

module.exports = ConnectionDb;