/**
 * Sensor Data Model
 *
 * Mongoose schema for storing real-time sensor data from the
 * autonomous underwater submarine's IoT system
 *
 * @module model/dataModel
 */

const mongoose = require('mongoose');

/**
 * Sensor Data Schema Definition
 *
 * Stores telemetry data from ESP8266 microcontroller including:
 * - Temperature readings from DS18B20 waterproof sensor
 * - TDS (Total Dissolved Solids) water quality measurements
 * - GPS coordinates and speed from TinyGPS++ module
 *
 * @typedef {Object} SensorData
 * @property {number} temperature - Water temperature in Celsius (DS18B20 sensor)
 * @property {number} TDS_Value - Total Dissolved Solids in PPM (parts per million)
 * @property {number} latitude - GPS latitude coordinate (-90 to 90)
 * @property {number} longitude - GPS longitude coordinate (-180 to 180)
 * @property {number} speed - Current speed in knots from GPS
 * @property {Date} timestamp - Data collection timestamp
 */
const sensorSchema = new mongoose.Schema(
  {
    temperature: {
      type: Number,
      validate: {
        validator: function (value) {
          // Temperature range: -50°C to 100°C (reasonable for underwater)
          return value >= -50 && value <= 100;
        },
        message: 'Temperature must be between -50°C and 100°C',
      },
    },

    TDS_Value: {
      type: Number,
      min: [0, 'TDS value cannot be negative'],
      max: [10000, 'TDS value seems unreasonably high'],
      validate: {
        validator: function (value) {
          return value >= 0;
        },
        message: 'TDS value must be a positive number',
      },
    },

    latitude: {
      type: Number,
      validate: {
        validator: function (value) {
          // Valid latitude range: -90 to 90
          return value >= -90 && value <= 90;
        },
        message: 'Latitude must be between -90 and 90 degrees',
      },
    },

    longitude: {
      type: Number,
      validate: {
        validator: function (value) {
          // Valid longitude range: -180 to 180
          return value >= -180 && value <= 180;
        },
        message: 'Longitude must be between -180 and 180 degrees',
      },
    },

    speed: {
      type: Number,
      default: 0,
      min: [0, 'Speed cannot be negative'],
      validate: {
        validator: function (value) {
          // Max reasonable speed for underwater vehicle: ~50 knots
          return value >= 0 && value <= 50;
        },
        message: 'Speed must be between 0 and 50 knots',
      },
    },

    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
      index: true, // Index for efficient time-based queries
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Indexes for better query performance
 * - Time-based queries (recent data)
 * - Geospatial queries (location-based)
 */
sensorSchema.index({ timestamp: -1 }); // Most recent first
sensorSchema.index({ latitude: 1, longitude: 1 }); // Geospatial queries

/**
 * Virtual property: Location string
 */
sensorSchema.virtual('location').get(function () {
  if (this.latitude && this.longitude) {
    return `${this.latitude.toFixed(6)}, ${this.longitude.toFixed(6)}`;
  }
  return 'Unknown';
});

/**
 * Virtual property: Water quality assessment based on TDS
 */
sensorSchema.virtual('waterQuality').get(function () {
  if (!this.TDS_Value) return 'Unknown';

  if (this.TDS_Value < 300) return 'Excellent';
  if (this.TDS_Value < 600) return 'Good';
  if (this.TDS_Value < 900) return 'Fair';
  if (this.TDS_Value < 1200) return 'Poor';
  return 'Unacceptable';
});

/**
 * Static method: Get recent sensor readings
 *
 * @param {number} limit - Number of records to retrieve
 * @returns {Promise<Array>} Array of sensor data documents
 */
sensorSchema.statics.getRecent = function (limit = 100) {
  return this.find()
    .sort({ timestamp: -1 })
    .limit(limit)
    .exec();
};

/**
 * Static method: Get sensor data within time range
 *
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} Array of sensor data documents
 */
sensorSchema.statics.getByDateRange = function (startDate, endDate) {
  return this.find({
    timestamp: { $gte: startDate, $lte: endDate },
  })
    .sort({ timestamp: -1 })
    .exec();
};

const Sensor = mongoose.model('Sensor', sensorSchema);

module.exports = Sensor;
