import express, { Express } from "express";
import { Server } from "http";
import WebSocket from "ws";
import { DroneRoutes } from "./routes";
import database from "./config/database";
import missionService from "./services/MissionService";

const app: Express = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await database.connect();

    const server: Server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

    // Initialize routes
    const droneRoutes = new DroneRoutes();
    app.use("/api", droneRoutes.getRouter());

    // WebSocket server for mission updates
    const wss = new WebSocket.Server({ server });

    wss.on("connection", (ws: WebSocket) => {
      console.log("Client connected ✅");

      ws.on("message", async (message: string) => {
        try {
          const data = JSON.parse(message.toString());

          if (data.type === "subscribe" && data.missionId) {
            // Check if mission exists before subscribing
            const mission = await missionService.getMission(data.missionId);

            if (!mission) {
              console.log(`❌ Mission not found: ${data.missionId}`);
              ws.send(
                JSON.stringify({
                  type: "error",
                  message: "Mission not found",
                  missionId: data.missionId,
                })
              );
              return;
            }

            console.log(`✅ Mission found, subscribing to: ${data.missionId}`);
            missionService.addWebSocketToMission(data.missionId, ws);

            // Send confirmation message
            ws.send(
              JSON.stringify({
                type: "subscribed",
                message: "Successfully subscribed to mission",
                missionId: data.missionId,
              })
            );
          } else {
            ws.send(
              JSON.stringify({
                type: "error",
                message:
                  'Invalid message format. Use: {"type": "subscribe", "missionId": "MISSION_ID"}',
              })
            );
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Invalid JSON format",
            })
          );
        }
      });

      ws.on("close", () => {
        console.log("Client disconnected ❌");
      });

      ws.on("error", (error) => {
        console.error("WebSocket error ❌:", error);
      });
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      console.log("Shutting down server...");
      missionService.cleanup();
      await database.disconnect();
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
