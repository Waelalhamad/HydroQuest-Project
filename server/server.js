/**
 * HydroQuest Monitoring System - Main Server
 *
 * This is the main entry point for the HydroQuest IoT monitoring system.
 * It handles real-time sensor data from an autonomous underwater submarine
 * via WebSocket connections, user authentication, and serves the dashboard UI.
 *
 * @author HydroQuest Team
 * @version 1.0.0
 */

// Load environment variables first
require('dotenv').config();

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const passport = require('passport');
const session = require('express-session');
const flash = require('express-flash');

// Import routes and controllers
const dashboardRoutes = require('./router/DataRouter');
const { handleSensorData } = require('./controller/DataController');
const ConnectionDb = require('./config/db');
const passportInit = require('./config/passport');
const authRouter = require('./router/authRouter');

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Set up WebSocket server for real-time sensor data streaming
const wss = new WebSocket.Server({ server });

/**
 * Configuration & Middleware Setup
 */

// Initialize Passport authentication strategy
passportInit(passport);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration with secure settings
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      httpOnly: true, // Prevent XSS attacks
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    },
  })
);

// Initialize Passport and session support
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Serve static files from the "public" directory
app.use(express.static('public'));

// Set EJS as the templating engine
app.set('view engine', 'ejs');

/**
 * Routes Configuration
 */
app.use('/', dashboardRoutes);
app.use('/auth', authRouter);

/**
 * WebSocket Connection Handler
 *
 * Manages real-time bidirectional communication with:
 * - Arduino ESP8266 (sensor data: temperature, TDS, GPS)
 * - Python computer vision module (video stream)
 * - Client browsers (dashboard updates)
 */
wss.on('connection', (ws) => {
  console.log('[WebSocket] New connection established');

  // Handle incoming messages from sensors or clients
  ws.on('message', (message) => {
    try {
      handleSensorData(ws, message, wss);
    } catch (error) {
      console.error('[WebSocket] Error handling message:', error.message);
    }
  });

  // Handle connection close
  ws.on('close', () => {
    console.log('[WebSocket] Connection closed');
  });

  // Handle WebSocket errors
  ws.on('error', (error) => {
    console.error('[WebSocket] Connection error:', error.message);
  });
});

/**
 * Error Handling Middleware
 */

// 404 Handler - Route not found
app.use((req, res, next) => {
  res.status(404).render('error', {
    message: 'Page not found',
    error: { status: 404, stack: '' }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.stack);

  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal Server Error'
    : err.message;

  res.status(status).render('error', {
    message,
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

/**
 * Server Initialization
 */

// Connect to MongoDB
ConnectionDb();

// Start the HTTP server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════════╗
  ║   HydroQuest Monitoring System v1.0.0     ║
  ╠════════════════════════════════════════════╣
  ║   Server: http://localhost:${PORT}           ║
  ║   WebSocket: ws://localhost:${PORT}          ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}              ║
  ╚════════════════════════════════════════════╝
  `);
});

// Graceful shutdown handler
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received, closing gracefully...');
  server.close(() => {
    console.log('[Server] HTTP server closed');
    process.exit(0);
  });
});
