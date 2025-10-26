# HydroQuest Monitoring System

<div align="center">

![HydroQuest Logo](server/public/assets/logo.png)

**Real-time IoT monitoring system for autonomous underwater submarine operations**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?logo=mongodb&logoColor=white)](https://www.mongodb.com/)

[Features](#features) • [Tech Stack](#tech-stack) • [Getting Started](#getting-started) • [Architecture](#architecture)

</div>

---

## Overview

HydroQuest is a **full-stack IoT monitoring platform** designed for real-time tracking and control of an autonomous underwater submarine. The system integrates hardware sensors (ESP8266), computer vision (YOLO), and a responsive web dashboard to provide comprehensive telemetry and mission monitoring capabilities.

### Key Highlights

- **Real-time Data Streaming**: WebSocket-based bidirectional communication for live sensor updates
- **IoT Integration**: ESP8266 microcontroller with temperature, TDS, and GPS sensors
- **Computer Vision**: YOLO-based object detection for underwater video analysis
- **Secure Authentication**: Passport.js with bcrypt password hashing and role-based access control
- **Interactive Dashboard**: Live gauges, Leaflet maps, and sensor data visualization
- **Production-Ready**: Environment-based configuration, error handling, and graceful shutdown

---

## Features

### Real-Time Sensor Monitoring

- **Temperature Tracking**: DS18B20 waterproof sensor with -50°C to 100°C range
- **Water Quality**: TDS (Total Dissolved Solids) measurement with quality assessment
- **GPS Navigation**: Latitude, longitude, and speed tracking with Leaflet map visualization
- **Live Updates**: Sub-second WebSocket data streaming to dashboard

### Computer Vision

- **Object Detection**: YOLO neural network for real-time underwater object recognition
- **Video Streaming**: Live camera feed with detection overlay
- **Python Integration**: OpenCV + asyncio for efficient frame processing

### Authentication & Security

- **User Management**: Registration, login, logout with session persistence
- **Password Security**: bcrypt hashing with 12 salt rounds
- **Role-Based Access**: User, Admin, and Moderator roles
- **Protected Routes**: Middleware-based authentication guards

### Interactive Dashboard

- **Gauges & Meters**: Round-slider components for temperature and TDS visualization
- **Map Interface**: Real-time submarine location on OpenStreetMap
- **Responsive Design**: Mobile-friendly Bootstrap 5 layout
- **Dark Theme**: Custom CSS variables for professional appearance

---

## Tech Stack

### Backend

| Technology         | Purpose                                  |
| ------------------ | ---------------------------------------- |
| **Node.js**        | Runtime environment                      |
| **Express.js**     | Web framework and API routes             |
| **WebSocket (ws)** | Real-time bidirectional communication    |
| **MongoDB**        | NoSQL database for sensor data and users |
| **Mongoose**       | ODM with schema validation               |
| **Passport.js**    | Authentication middleware                |
| **bcrypt**         | Password hashing                         |

### Frontend

| Technology       | Purpose                  |
| ---------------- | ------------------------ |
| **EJS**          | Server-side templating   |
| **Bootstrap 5**  | Responsive UI framework  |
| **Leaflet.js**   | Interactive mapping      |
| **Round-slider** | Gauge components         |
| **jQuery**       | DOM manipulation         |
| **AOS & Swiper** | Animations and carousels |

### Hardware/IoT

| Component      | Purpose                       |
| -------------- | ----------------------------- |
| **ESP8266**    | WiFi microcontroller          |
| **DS18B20**    | Waterproof temperature sensor |
| **TDS Sensor** | Water quality measurement     |
| **TinyGPS++**  | GPS module for navigation     |

### ML/Computer Vision

| Technology               | Purpose                 |
| ------------------------ | ----------------------- |
| **Python**               | ML script runtime       |
| **OpenCV**               | Computer vision library |
| **YOLO**                 | Object detection model  |
| **asyncio + websockets** | Async video streaming   |

---

## Getting Started

### Prerequisites

- **Node.js** >= 16.0.0
- **MongoDB** >= 4.0
- **Python** >= 3.8 (for computer vision module)
- **Arduino IDE** (for ESP8266 firmware)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Waelalhamad/HydroQuest-Website.git
   cd HydroQuest-Website
   ```

2. **Install Node.js dependencies**

   ```bash
   cd server
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp ../.env.example .env
   # Edit .env with your configuration
   ```

   Example `.env`:

   ```env
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/submarineDB
   SESSION_SECRET=your-super-secret-key-here
   ```

4. **Start MongoDB**

   ```bash
   # macOS (Homebrew)
   brew services start mongodb-community

   # Linux (systemd)
   sudo systemctl start mongod

   # Windows
   net start MongoDB
   ```

5. **Run the server**

   ```bash
   npm start       # Production mode
   npm run dev     # Development mode (nodemon)
   ```

6. **Access the application**
   ```
   http://localhost:3000
   ```

### Hardware Setup

1. **Flash ESP8266 firmware**
   - Open `arduino/EjsSensors/EjsSensors.ino` in Arduino IDE
   - Update WiFi credentials and server IP
   - Select board: ESP8266 (NodeMCU 1.0)
   - Upload to microcontroller

### Python Computer Vision (Optional)

1. **Install Python dependencies**

   ```bash
   cd python
   pip install opencv-python numpy websockets asyncio
   ```

2. **Download YOLO model**

   - Place `yolov3.weights` in `python/` directory
   - Update `config.pbtxt` and `weight.pb` paths

3. **Run object detection**
   ```bash
   python main.py
   ```

---

## Project Structure

```
HydroQuest/
├── server/                           # Node.js/Express Backend Application
│   ├── config/                       # Configuration Modules
│   │   ├── db.js                    # MongoDB connection with Mongoose
│   │   └── passport.js              # Passport.js local authentication strategy
│   │
│   ├── controller/                   # Business Logic Handlers
│   │   ├── authController.js        # User registration, login, logout
│   │   └── DataController.js        # WebSocket sensor data processing
│   │
│   ├── middleware/                   # Custom Middleware
│   │   └── authenticate.js          # Authentication guards (protect, loggedIn)
│   │
│   ├── model/                        # Mongoose Database Schemas
│   │   ├── userModel.js             # User schema with roles & bcrypt hashing
│   │   └── dataModel.js             # Sensor data schema (temp, TDS, GPS)
│   │
│   ├── router/                       # Express Route Handlers
│   │   ├── authRouter.js            # Auth routes (/login, /signup, /register, /logout)
│   │   └── DataRouter.js            # Dashboard routes (/, /dashboard/*, sensors)
│   │
│   ├── views/                        # EJS Templating Engine
│   │   ├── index.ejs                # Landing/home page
│   │   ├── dashboard.ejs            # Main dashboard container
│   │   ├── components/              # Reusable Dashboard Components
│   │   │   ├── camera.ejs          # Video feed with object detection
│   │   │   ├── location.ejs        # GPS map with Leaflet.js
│   │   │   └── sensors.ejs         # Temperature & TDS gauges
│   │   └── security/                # Authentication Pages
│   │       ├── login.ejs           # Login form
│   │       └── signup.ejs          # Registration form
│   │
│   ├── public/                       # Static Assets (Served by Express)
│   │   ├── assets/                  # Images & Media
│   │   │   ├── logo.png            # HydroQuest logo (129 KB)
│   │   │   ├── logo.svg            # Vector logo (240 KB)
│   │   │   ├── favicon.ico         # Browser tab icon
│   │   │   ├── img-submarine.jpg   # Submarine image
│   │   │   ├── slider-*.jpg        # Homepage carousel images
│   │   │   └── download.png        # Download button graphic
│   │   │
│   │   ├── css/                     # Stylesheets
│   │   │   ├── style.css           # Main global styles
│   │   │   ├── dashboardStyle.css  # Dashboard layout
│   │   │   ├── securityStyle.css   # Login/signup forms
│   │   │   ├── sensors.css         # Gauge components
│   │   │   ├── camera.css          # Video component
│   │   │   └── location.css        # Map component
│   │   │
│   │   └── js/                      # Client-Side JavaScript
│   │       └── main.js             # Navigation, scroll effects, WebSocket client
│   │
│   ├── server.js                    # Main Entry Point (HTTP + WebSocket server)
│   ├── package.json                 # npm dependencies & scripts
│   └── package-lock.json            # Locked dependency versions
│
├── arduino/                          # ESP8266 IoT Firmware
│   └── EjsSensors/
│       └── EjsSensors.ino           # Arduino sketch for sensors (DS18B20, TDS, GPS)
│
├── python/                           # Computer Vision Module
│   ├── main.py                      # YOLO object detection script
│   ├── config.pbtxt                 # YOLO model configuration
│   ├── weight.pb                    # Pre-trained YOLO weights (download separately)
│   └── coco.names                   # Object class labels
│
├── .env.example                     # Environment variables template
├── .gitignore                       # Git exclusion rules
├── LICENSE                          # MIT License
└── README.md                        # Project documentation
```

### Directory Descriptions

#### `server/` - Backend Application
The Node.js/Express server handles all web requests, WebSocket connections, authentication, and database operations. It follows the **MVC (Model-View-Controller)** architecture pattern for clean separation of concerns.

- **config/**: Database connection and authentication strategy configuration
- **controller/**: Business logic for handling authentication and real-time sensor data
- **middleware/**: Custom middleware for route protection and authentication checks
- **model/**: Mongoose schemas defining data structure and validation rules
- **router/**: Express route definitions mapping URLs to controller functions
- **views/**: EJS templates rendered server-side for dynamic HTML generation
- **public/**: Static files (CSS, JavaScript, images) served directly to clients
- **server.js**: Application entry point initializing Express, WebSocket, and middleware

#### `arduino/` - IoT Firmware
Contains the ESP8266 microcontroller firmware that reads sensor data from DS18B20 (temperature), TDS (water quality), and GPS modules, then transmits it via WebSocket to the Node.js server.

#### `python/` - Computer Vision
YOLO-based object detection system that processes live camera feeds, identifies underwater objects, and streams annotated video frames to the dashboard via WebSocket.

### Key Files

| File | Purpose | Size |
|------|---------|------|
| `server/server.js` | HTTP + WebSocket server initialization | 4.6 KB |
| `server/config/db.js` | MongoDB connection with error handling | 1.2 KB |
| `server/controller/DataController.js` | Sensor data WebSocket handler | 2.8 KB |
| `server/model/userModel.js` | User schema with bcrypt & role-based access | 3.4 KB |
| `server/public/js/main.js` | Client-side WebSocket & UI interactions | 6.3 KB |
| `arduino/EjsSensors/EjsSensors.ino` | ESP8266 sensor firmware | 117 lines |
| `python/main.py` | YOLO object detection script | 88 lines |

---

## API Documentation

### Authentication Endpoints

| Method | Endpoint         | Description              | Auth Required |
| ------ | ---------------- | ------------------------ | ------------- |
| GET    | `/auth/login`    | Render login page        | No            |
| POST   | `/auth/login`    | Authenticate user        | No            |
| GET    | `/auth/signup`   | Render registration page | No            |
| POST   | `/auth/register` | Create new user          | No            |
| POST   | `/auth/logout`   | End user session         | Yes           |

### Dashboard Endpoints

| Method | Endpoint              | Description    | Auth Required |
| ------ | --------------------- | -------------- | ------------- |
| GET    | `/`                   | Landing page   | No            |
| GET    | `/dashboard`          | Main dashboard | Yes           |
| GET    | `/dashboard/video`    | Camera feed    | Yes           |
| GET    | `/dashboard/location` | Map view       | Yes           |
| GET    | `/dashboard/sensors`  | Sensor details | Yes           |

### WebSocket Events

```javascript
// Connect to WebSocket
const ws = new WebSocket("ws://localhost:3000");

// Receive sensor data
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Temperature:", data.temperature);
  console.log("TDS:", data.TDS_Value);
  console.log("Location:", data.latitude, data.longitude);
};

// Send data (from ESP8266)
ws.send(
  JSON.stringify({
    temperature: 25.5,
    TDS_Value: 450,
    latitude: 31.9686,
    longitude: 35.9163,
    speed: 1.5,
  })
);
```

---

## Development

### Code Quality Standards

This project follows industry best practices:

- **JSDoc Documentation**: All functions documented with type annotations
- **Error Handling**: Comprehensive try-catch blocks and validation
- **Environment Configuration**: No hardcoded credentials
- **Security**: bcrypt hashing, httpOnly cookies, session secrets
- **Database Indexing**: Optimized queries with strategic indexes
- **RESTful Design**: Clean, semantic API endpoints
- **Modular Architecture**: Separation of concerns (MVC pattern)

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- **Team Hope** - Original development team
- **DS18B20** - Dallas Semiconductor temperature sensor
- **Leaflet.js** - Open-source mapping library
- **YOLO** - Real-time object detection system
- **MongoDB** - NoSQL database platform

---

## Contact

**HydroQuest Team**

- Email: contact@waelalhamad.com
- GitHub: [@Waelalhamad](https://github.com/Waelalhamad)

---

<div align="center">

**Built with passion for underwater exploration**

Star this repo if you find it helpful!

</div>
