# Live Telemetry Backend

A real-time drone telemetry backend service built with Node.js, Express, TypeScript, and MongoDB. This service provides REST API endpoints for mission management and WebSocket connections for real-time telemetry data streaming.

## 🚀 Features

- **Mission Management**: Create, monitor, and end drone missions
- **Real-time Telemetry**: WebSocket-based live telemetry data streaming
- **MongoDB Integration**: Persistent storage for missions and telemetry history
- **TypeScript**: Full type safety and better development experience
- **RESTful API**: Clean and well-documented API endpoints
- **CORS Support**: Cross-origin resource sharing enabled for frontend integration

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**

## 🛠️ Installation

1. **Clone the repository and navigate to the backend directory:**

   ```bash
   cd backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the backend directory:

   ```env
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/live-telemetry
   ```

4. **Start MongoDB:**
   Make sure MongoDB is running on your system. If using Docker:
   ```bash
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

## 🚀 Running the Application

### Development Mode

```bash
npm start
```

This starts the server with nodemon for automatic reloading on file changes.

### Production Mode

```bash
npm run build
npm run serve
```

The server will start on `http://localhost:3001` (or the port specified in your `.env` file).

## 📡 API Endpoints

### Base URL

```
http://localhost:3001/api
```

### 1. Start Mission

**POST** `/start-mission`

Creates a new drone mission.

**Response:**

```json
{
  "success": true,
  "mission": {
    "missionId": "mission_1234567890",
    "status": "in_mission",
    "startTime": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Get All Missions

**GET** `/missions`

Retrieves all missions.

**Response:**

```json
{
  "success": true,
  "missions": [
    {
      "missionId": "mission_1234567890",
      "status": "in_mission",
      "startTime": "2024-01-15T10:30:00.000Z",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### 3. Get Mission Details

**GET** `/missions/:missionId`

Retrieves details of a specific mission.

**Response:**

```json
{
  "success": true,
  "mission": {
    "missionId": "mission_1234567890",
    "status": "in_mission",
    "startTime": "2024-01-15T10:30:00.000Z",
    "endTime": null,
    "totalFlightTime": 0,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "connectedClients": 2
  }
}
```

### 4. End Mission

**POST** `/missions/:missionId/end`

Ends a specific mission.

**Response:**

```json
{
  "success": true,
  "message": "Mission ended successfully",
  "mission": {
    "missionId": "mission_1234567890",
    "status": "completed",
    "endTime": "2024-01-15T11:30:00.000Z",
    "totalFlightTime": 3600
  }
}
```

### 5. Get Mission Telemetry

**GET** `/missions/:missionId/telemetry?limit=100`

Retrieves telemetry history for a specific mission.

**Query Parameters:**

- `limit` (optional): Number of telemetry records to return (default: 100)

**Response:**

```json
{
  "success": true,
  "missionId": "mission_1234567890",
  "count": 50,
  "telemetry": [
    {
      "timestamp": "2024-01-15T10:30:00.000Z",
      "battery": 85,
      "latitude": 37.7749,
      "longitude": -122.4194,
      "altitude": 100.5
    }
  ]
}
```

### 6. Get System Status

**GET** `/status`

Retrieves overall system status.

**Response:**

```json
{
  "totalMissions": 5,
  "activeMissions": 2,
  "connectedClients": 3
}
```

## 🔌 WebSocket API

### Connection

Connect to the WebSocket server at:

```
ws://localhost:3001
```

### Subscribe to Mission Updates

Send a subscription message to receive real-time telemetry updates for a specific mission:

```json
{
  "type": "subscribe",
  "missionId": "mission_1234567890"
}
```

### Response Messages

**Subscription Confirmation:**

```json
{
  "type": "subscribed",
  "message": "Successfully subscribed to mission",
  "missionId": "mission_1234567890"
}
```

**Telemetry Updates:**

```json
{
  "battery": 85,
  "latitude": 37.7749,
  "longitude": -122.4194,
  "altitude": 100.5,
  "status": "in_mission"
}
```

**Error Messages:**

```json
{
  "type": "error",
  "message": "Mission not found"
}
```

## 📊 Data Models

### Mission

```typescript
interface IMission {
  missionId: string;
  startTime: Date;
  endTime?: Date;
  status: DroneStatus;
  totalFlightTime?: number; // in seconds
  createdAt: Date;
  updatedAt: Date;
}
```

### Telemetry History

```typescript
interface ITelemetryHistory {
  missionId: string;
  timestamp: Date;
  battery: number;
  latitude: number;
  longitude: number;
  altitude: number;
  createdAt: Date;
}
```

### Drone Status Enum

```typescript
enum DroneStatus {
  PAUSED = "paused",
  IN_MISSION = "in_mission",
  COMPLETED = "completed",
}
```

## 🔧 Configuration

### Environment Variables

- `PORT`: Server port (default: 3001)
- `MONGODB_URI`: MongoDB connection string (default: mongodb://localhost:27017/live-telemetry)

### CORS Configuration

The server is configured to accept requests from `http://localhost:5173` (Vite dev server). Update the CORS configuration in `src/index.ts` if needed.

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # MongoDB connection configuration
│   ├── models/
│   │   ├── Mission.ts           # Mission data model
│   │   └── TelemetryHistory.ts  # Telemetry history model
│   ├── services/
│   │   └── MissionService.ts    # Mission business logic
│   ├── enums.ts                 # Application enums
│   ├── index.ts                 # Main server file
│   ├── routes.ts                # API route definitions
│   ├── types.d.ts               # TypeScript type definitions
│   └── websocket.ts             # WebSocket service
├── package.json
├── tsconfig.json
└── README.md
```
