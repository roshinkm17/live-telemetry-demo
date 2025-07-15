import WebSocket from "ws";
import { Telemetry } from "./types";
import { DroneStatus } from "./enums";

export class WebSocketService {
  private wss: WebSocket.Server;
  private droneState: Telemetry;
  private updateIntervals: Map<WebSocket, NodeJS.Timeout> = new Map();

  constructor(server: any, initialDroneState: Telemetry) {
    this.wss = new WebSocket.Server({ server });
    this.droneState = initialDroneState;
    this.initialize();
  }

  private initialize(): void {
    this.wss.on("connection", (ws: WebSocket) => {
      this.handleConnection(ws);
    });
  }

  private handleConnection(ws: WebSocket): void {
    console.log("Client connected ✅");

    const interval = setInterval(() => {
      this.updateDroneState();
      ws.send(JSON.stringify(this.droneState));
    }, 2000);

    this.updateIntervals.set(ws, interval);

    ws.on("close", () => {
      console.log("Client disconnected ❌");
      this.handleDisconnection(ws);
    });

    ws.on("error", (error) => {
      console.error("WebSocket error ❌:", error);
      this.handleDisconnection(ws);
    });
  }

  private handleDisconnection(ws: WebSocket): void {
    const interval = this.updateIntervals.get(ws);
    if (interval) {
      clearInterval(interval);
      this.updateIntervals.delete(ws);
    }
  }

  private updateDroneState(): void {
    this.droneState.battery = Math.max(0, this.droneState.battery - 1);
    this.droneState.latitude += (Math.random() - 0.5) * 0.001;
    this.droneState.longitude += (Math.random() - 0.5) * 0.001;
    this.droneState.altitude += (Math.random() - 0.5) * 0.1;
  }

  public updateDroneStatus(status: DroneStatus): void {
    this.droneState.status = status;
  }

  public getDroneState(): Telemetry {
    return { ...this.droneState };
  }

  public broadcast(message: any): void {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  public getConnectedClientsCount(): number {
    return this.wss.clients.size;
  }

  public close(): void {
    this.updateIntervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.updateIntervals.clear();
    this.wss.close();
  }
}
