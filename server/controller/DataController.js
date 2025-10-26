/**
 * Data Controller
 *
 * Handles real-time sensor data processing from IoT devices
 * Manages WebSocket communication and data persistence
 *
 * @module controller/DataController
 */

const Sensor = require('../model/dataModel');
const WebSocket = require('ws');

/**
 * Handles incoming sensor data from WebSocket connections
 *
 * Processes sensor data from ESP8266 microcontroller including:
 * - Temperature readings (DS18B20 sensor)
 * - TDS (Total Dissolved Solids) measurements
 * - GPS coordinates and speed
 *
 * Saves data to MongoDB and broadcasts to all connected dashboard clients
 *
 * @async
 * @param {WebSocket} ws - The WebSocket connection that sent the message
 * @param {Buffer|string} message - Raw sensor data message
 * @param {WebSocket.Server} wss - WebSocket server instance for broadcasting
 * @returns {Promise<void>}
 *
 * @example
 * Expected message format:
 * {
 *   "temperature": 25.5,
 *   "TDS_Value": 450,
 *   "latitude": 31.9686,
 *   "longitude": 35.9163,
 *   "speed": 1.5
 * }
 */
exports.handleSensorData = async (ws, message, wss) => {
  try {
    // Convert Buffer to string and parse JSON
    const messageStr = message.toString();
    const data = JSON.parse(messageStr);

    // Log received data for debugging
    console.log('[DataController] Received sensor data:', {
      temperature: data.temperature,
      TDS: data.TDS_Value,
      location: `${data.latitude}, ${data.longitude}`,
      timestamp: new Date().toISOString()
    });

    // Validate required fields
    if (!data.temperature && !data.TDS_Value && !data.latitude) {
      console.warn('[DataController] Incomplete sensor data received');
      return;
    }

    // Save data to MongoDB using Mongoose
    const sensorData = new Sensor({
      ...data,
      timestamp: new Date() // Add server timestamp
    });

    await sensorData.save();
    console.log('[DataController] Sensor data saved to MongoDB (ID:', sensorData._id, ')');

    // Broadcast the data to all connected dashboard clients
    let broadcastCount = 0;
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
        broadcastCount++;
      }
    });

    console.log(`[DataController] Broadcasted to ${broadcastCount} connected clients`);

  } catch (err) {
    // Handle JSON parse errors
    if (err instanceof SyntaxError) {
      console.error('[DataController] Invalid JSON received:', message.toString());
      return;
    }

    // Handle database errors
    if (err.name === 'ValidationError') {
      console.error('[DataController] Validation error:', err.message);
      return;
    }

    // Log other errors
    console.error('[DataController] Error handling WebSocket message:', err.message);
    console.error('[DataController] Stack trace:', err.stack);
  }
};
