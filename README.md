# Live Telemetry System

A real-time drone telemetry monitoring system with live map visualization, mission management, and historical data tracking.

## 🚀 Features

### 📊 Real-time Mission Dashboard with Live Map & Streaming

Monitor all active and completed drone missions from a centralized dashboard with an interactive live map showing real-time drone position, telemetry data (battery level, altitude, GPS coordinates), and live streaming updates via WebSocket connection with instant battery warnings and mission status changes.

> https://github.com/user-attachments/assets/6d30722a-0edc-478b-8545-1bd83ecbf51a

### 🎯 Mission Management

Start new missions, monitor progress, and end missions with a single click.

> <img width="1938" height="998" alt="image" src="https://github.com/user-attachments/assets/5ca83f27-5b9e-4036-b3fd-63e1868b8b82" />

### 📈 Historical Data Analysis

View complete flight paths and telemetry history for completed missions.

> <img width="1839" height="898" alt="image" src="https://github.com/user-attachments/assets/f90c99a3-db5d-4eb3-9528-1fdb0cd10203" />


### 🔔 Smart Notifications

Get instant alerts for low battery, mission completion, and system events.

> <img width="2282" height="1233" alt="image" src="https://github.com/user-attachments/assets/b61355e0-25b9-48eb-ac9f-cf33af183eb8" />


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
