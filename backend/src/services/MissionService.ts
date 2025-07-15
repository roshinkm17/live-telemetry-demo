import WebSocket from "ws";
import Mission, { IMission } from "../models/Mission";
import TelemetryHistory from "../models/TelemetryHistory";
import { DroneStatus } from "../enums";

export class MissionService {
  private missionWebSockets: Map<string, Set<WebSocket>> = new Map();
  private missionIntervals: Map<string, NodeJS.Timeout> = new Map();
  private missionTelemetry: Map<string, any> = new Map();

  public async createMission(): Promise<IMission> {
    const missionId = this.generateMissionId();

    const mission = new Mission({
      missionId,
      startTime: new Date(),
      status: DroneStatus.IN_MISSION,
    });

    const savedMission = await mission.save();
    console.log(`Mission created: (ID: ${missionId})`);

    // Start telemetry updates immediately for this mission
    this.initializeMissionTelemetry(missionId);
    this.startTelemetryUpdates(missionId);

    return savedMission;
  }

  public async getMission(missionId: string): Promise<IMission | null> {
    return await Mission.findOne({ missionId });
  }

  public async getAllMissions(): Promise<IMission[]> {
    return await Mission.find().sort({ createdAt: -1 });
  }

  public async updateMissionStatus(
    missionId: string,
    status: DroneStatus
  ): Promise<IMission | null> {
    const updateData: any = { status };

    if (status === DroneStatus.COMPLETED) {
      updateData.endTime = new Date();
      // Calculate total flight time
      const mission = await this.getMission(missionId);
      if (mission) {
        const flightTime = Math.floor(
          (new Date().getTime() - mission.startTime.getTime()) / 1000
        );
        updateData.totalFlightTime = flightTime;
      }
    }

    return await Mission.findOneAndUpdate({ missionId }, updateData, {
      new: true,
    });
  }

  public async getTelemetryHistory(
    missionId: string,
    limit: number = 100
  ): Promise<any[]> {
    return await TelemetryHistory.find({ missionId })
      .sort({ timestamp: -1 })
      .limit(limit);
  }

  public async endMission(missionId: string): Promise<IMission | null> {
    // Stop telemetry updates
    this.stopTelemetryUpdates(missionId);

    // Update mission status
    return await this.updateMissionStatus(missionId, DroneStatus.COMPLETED);
  }

  public addWebSocketToMission(missionId: string, ws: WebSocket): void {
    if (!this.missionWebSockets.has(missionId)) {
      this.missionWebSockets.set(missionId, new Set());
    }

    this.missionWebSockets.get(missionId)!.add(ws);
    console.log(`📡 WebSocket added to mission ${missionId}`);

    // Send initial mission data immediately
    this.sendMissionUpdate(missionId);

    ws.on("close", () => {
      this.removeWebSocketFromMission(missionId, ws);
    });

    ws.on("error", (error) => {
      console.error(`WebSocket error for mission ${missionId}:`, error);
      this.removeWebSocketFromMission(missionId, ws);
    });
  }

  public removeWebSocketFromMission(missionId: string, ws: WebSocket): void {
    const missionWs = this.missionWebSockets.get(missionId);
    if (missionWs) {
      missionWs.delete(ws);
      console.log(`WebSocket removed from mission ${missionId}`);
      // Note: We don't stop telemetry updates when clients disconnect
      // Telemetry continues to be recorded even without active connections
    }
  }

  public async sendMissionUpdate(missionId: string): Promise<void> {
    try {
      const mission = await this.getMission(missionId);
      if (!mission) return;

      const missionWs = this.missionWebSockets.get(missionId);
      if (missionWs) {
        const message = JSON.stringify({
          missionId: mission.missionId,
          status: mission.status,
          startTime: mission.startTime,
          timestamp: new Date(),
        });

        missionWs.forEach((ws) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(message);
          }
        });
      }
    } catch (error) {
      console.error(`Error sending mission update for ${missionId}:`, error);
    }
  }

  private initializeMissionTelemetry(missionId: string): void {
    this.missionTelemetry.set(missionId, {
      battery: 100,
      latitude: 18.5914 + (Math.random() - 0.5) * 0.01, // Random starting position
      longitude: 73.7381 + (Math.random() - 0.5) * 0.01, // Random starting position
      altitude: 50 + Math.random() * 100, // Random starting altitude
    });
  }

  private startTelemetryUpdates(missionId: string): void {
    const interval = setInterval(async () => {
      try {
        const telemetry = this.missionTelemetry.get(missionId);
        if (!telemetry) return;

        // Update telemetry with realistic changes
        const updatedTelemetry = this.updateTelemetryData(telemetry);
        this.missionTelemetry.set(missionId, updatedTelemetry);

        // Store telemetry in database
        await this.storeTelemetryHistory(missionId, updatedTelemetry);

        // Send to all connected WebSockets
        this.broadcastTelemetry(missionId, updatedTelemetry);
      } catch (error) {
        console.error(
          `Error updating telemetry for mission ${missionId}:`,
          error
        );
      }
    }, 2000);

    this.missionIntervals.set(missionId, interval);
    console.log(`🔄 Started telemetry updates for mission ${missionId}`);
  }

  private stopTelemetryUpdates(missionId: string): void {
    const interval = this.missionIntervals.get(missionId);
    if (interval) {
      clearInterval(interval);
      this.missionIntervals.delete(missionId);
      console.log(`⏹️ Stopped telemetry updates for mission ${missionId}`);
    }
  }

  private updateTelemetryData(currentTelemetry: any): any {
    return {
      battery: Math.max(0, currentTelemetry.battery - 0.1), // Gradual battery drain
      latitude: currentTelemetry.latitude + (Math.random() - 0.5) * 0.001, // Small random movement
      longitude: currentTelemetry.longitude + (Math.random() - 0.5) * 0.001,
      altitude: Math.max(
        10,
        currentTelemetry.altitude + (Math.random() - 0.5) * 2
      ), // Small altitude changes
    };
  }

  private async storeTelemetryHistory(
    missionId: string,
    telemetry: any
  ): Promise<void> {
    try {
      const telemetryRecord = new TelemetryHistory({
        missionId,
        timestamp: new Date(),
        battery: telemetry.battery,
        latitude: telemetry.latitude,
        longitude: telemetry.longitude,
        altitude: telemetry.altitude,
      });

      await telemetryRecord.save();
    } catch (error) {
      console.error(
        `Error storing telemetry history for mission ${missionId}:`,
        error
      );
    }
  }

  private broadcastTelemetry(missionId: string, telemetry: any): void {
    const missionWs = this.missionWebSockets.get(missionId);
    if (missionWs) {
      const message = JSON.stringify({
        type: "telemetry",
        missionId: missionId,
        timestamp: new Date(),
        data: telemetry,
      });

      missionWs.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        }
      });
    }
  }

  private generateMissionId(): string {
    return `MISSION_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public getConnectedClientsCount(missionId: string): number {
    const missionWs = this.missionWebSockets.get(missionId);
    return missionWs ? missionWs.size : 0;
  }

  public getAllConnectedClientsCount(): number {
    let total = 0;
    this.missionWebSockets.forEach((wsSet) => {
      total += wsSet.size;
    });
    return total;
  }

  public cleanup(): void {
    this.missionIntervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.missionIntervals.clear();
    this.missionWebSockets.clear();
    this.missionTelemetry.clear();
  }
}

export default new MissionService();
