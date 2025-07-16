# Live Telemetry Frontend

A modern React-based frontend application for real-time drone telemetry monitoring. Built with TypeScript, Vite, Tailwind CSS, and React Query for optimal performance and developer experience.

## 🚀 Features

- **Real-time Telemetry**: Live drone position and status updates via WebSocket
- **Interactive Map**: Leaflet-based map with flight path visualization
- **Mission Management**: Start, monitor, and end drone missions
- **Mission History**: View past missions and their telemetry data
- **Responsive Design**: Modern UI with Tailwind CSS and Radix UI components
- **Type Safety**: Full TypeScript support throughout the application
- **Real-time Notifications**: Toast notifications for mission events and errors

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Backend Service**: Make sure the [backend service](../backend/README.md) is running

## 🛠️ Installation

1. **Clone the repository and navigate to the frontend directory:**

   ```bash
   cd frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the frontend directory:

   ```env
   VITE_API_URL=http://localhost:3001
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`.

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

Starts the Vite development server with hot module replacement.

### Production Build

```bash
npm run build
npm run preview
```

Builds the application for production and serves it locally.

### Linting

```bash
npm run lint
```

Runs ESLint to check for code quality issues.

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   ├── mission.ts           # API functions for mission operations
│   │   └── types.d.ts           # API type definitions
│   ├── components/
│   │   ├── mission-history/     # Mission history components
│   │   ├── telemetry-data/      # Map and telemetry visualization
│   │   ├── ui/                  # Reusable UI components (Radix UI)
│   │   ├── 404.tsx             # 404 error page
│   │   └── back-button.tsx      # Navigation component
│   ├── constants/
│   │   └── mission.ts           # Mission-related constants
│   ├── enums/
│   │   └── mission-status.ts    # Mission status enums
│   ├── hooks/
│   │   ├── useMission.ts        # Mission management hooks
│   │   └── useWebSocket.ts      # WebSocket connection hook
│   ├── lib/
│   │   ├── axios.ts             # HTTP client configuration
│   │   ├── date-utils.ts        # Date formatting utilities
│   │   └── utils.ts             # General utility functions
│   ├── pages/
│   │   ├── Dashboard.tsx        # Main dashboard page
│   │   ├── MissionView.tsx      # Individual mission view
│   │   └── types.d.ts           # Page-specific types
│   ├── App.tsx                  # Main application component
│   ├── main.tsx                 # Application entry point
│   └── index.css                # Global styles
├── public/                      # Static assets
├── package.json
├── vite.config.ts               # Vite configuration
├── tailwind.config.js           # Tailwind CSS configuration
└── tsconfig.json                # TypeScript configuration
```

## 🎯 Key Components

### Dashboard (`/`)

- **Mission History**: Displays all past and active missions
- **Start Mission**: Button to initiate a new drone mission
- **Real-time Status**: Shows active missions and system status

### Mission View (`/mission/:missionId`)

- **Interactive Map**: Real-time drone position with Leaflet
- **Telemetry Data**: Live battery, altitude, and GPS coordinates
- **Mission Controls**: End mission functionality
- **Flight Path**: Historical flight path visualization for completed missions
- **Real-time Notifications**: Battery warnings and mission status updates

## 🔌 API Integration

The frontend communicates with the backend through:

### REST API (via Axios)

- **Base URL**: `http://localhost:3001` (configurable via `VITE_API_URL`)
- **Endpoints**: All mission management operations
- **Error Handling**: Automatic error handling with toast notifications

### WebSocket Connection

- **URL**: `ws://localhost:3001`
- **Protocol**: JSON-based message exchange
- **Real-time Updates**: Live telemetry data streaming
- **Auto-reconnection**: Automatic reconnection on connection loss

## 🎨 UI/UX Features

### Design System

- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Lucide React**: Beautiful icon library
- **Sonner**: Toast notification system

## 🔗 Backend Integration

This frontend application requires the backend service to be running. For backend setup and API documentation, see:

**[Backend README](../backend/README.md)**

The backend provides:

- REST API endpoints for mission management
- WebSocket server for real-time telemetry
- MongoDB database for data persistence
- Mission and telemetry data models

## 🔗 Related Documentation

- **[Backend API Documentation](../backend/README.md)**
- **[React Documentation](https://react.dev/)**
- **[Vite Documentation](https://vitejs.dev/)**
- **[Tailwind CSS Documentation](https://tailwindcss.com/)**
- **[Leaflet Documentation](https://leafletjs.com/)**
