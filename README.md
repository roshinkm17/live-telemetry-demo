# Live Telemetry System

A real-time drone telemetry monitoring system with live map visualization, mission management, and historical data tracking.

## 🚀 Features

### 📊 Real-time Mission Dashboard with Live Map & Streaming

Monitor all active and completed drone missions from a centralized dashboard with an interactive live map showing real-time drone position, telemetry data (battery level, altitude, GPS coordinates), and live streaming updates via WebSocket connection with instant battery warnings and mission status changes.

> 📸 **Screenshot Placeholder**: Dashboard with mission list, interactive Leaflet map showing drone position marker and flight path, and real-time telemetry panel with battery percentage, coordinates, altitude, and connection status

### 🎯 Mission Management

Start new missions, monitor progress, and end missions with a single click.

> 📸 **Screenshot Placeholder**: Mission control panel with start/end buttons, mission ID display, and status indicators

### 📈 Historical Data Analysis

View complete flight paths and telemetry history for completed missions.

> 📸 **Screenshot Placeholder**: Mission history view showing flight path visualization and telemetry data charts

### 🔔 Smart Notifications

Get instant alerts for low battery, mission completion, and system events.

> 📸 **Screenshot Placeholder**: Toast notification showing low battery warning with battery icon and percentage

## 🏗️ Architecture

```
┌─────────────────┐    WebSocket    ┌─────────────────┐
│   Frontend      │ ◄─────────────► │    Backend      │
│   (React)       │                 │   (Node.js)     │
└─────────────────┘                 └─────────────────┘
         │                                   │
         │ HTTP API                          │
         ▼                                   ▼
┌─────────────────┐                 ┌─────────────────┐
│   Browser       │                 │   MongoDB       │
│   (Leaflet)     │                 │   Database      │
└─────────────────┘                 └─────────────────┘
```

## 🛠️ Tech Stack

### Frontend

- **React 19** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Leaflet** for interactive maps
- **React Query** for state management
- **WebSocket** for real-time updates

### Backend

- **Node.js** with Express
- **TypeScript** for type safety
- **MongoDB** for data persistence
- **WebSocket** server for real-time communication

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- MongoDB (v4.4+)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd live-telemetry
   ```

2. **Start the backend**

   ```bash
   cd backend
   npm install
   npm start
   ```

3. **Start the frontend**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 📱 Usage

1. **Start a Mission**: Click "Start Mission" on the dashboard
2. **Monitor Progress**: View real-time position and telemetry on the map
3. **Track Battery**: Monitor battery levels with automatic warnings
4. **End Mission**: Click "End Mission" when complete
5. **Review History**: View past missions and flight paths

## 📚 Documentation

- **[Backend API Documentation](backend/README.md)** - Complete API reference and setup guide
- **[Frontend Documentation](frontend/README.md)** - Frontend setup and component guide

## 🎯 Use Cases

- **Drone Fleet Management**: Monitor multiple drones simultaneously
- **Search & Rescue**: Track drone position during emergency operations
- **Aerial Photography**: Monitor drone location during photo/video missions
- **Research & Development**: Collect telemetry data for analysis
- **Training & Education**: Demonstrate drone operations and safety

#
