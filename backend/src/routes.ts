import { Router, Request, Response } from "express";
import { DroneStatus } from "./enums";
import missionService from "./services/MissionService";

export class DroneRoutes {
  private router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/start-mission", this.startMission.bind(this));
    this.router.post("/missions/:missionId/end", this.endMission.bind(this));
    this.router.get("/status", this.getStatus.bind(this));
    this.router.get("/missions", this.getAllMissions.bind(this));
    this.router.get("/missions/:missionId", this.getMission.bind(this));
    this.router.get(
      "/missions/:missionId/telemetry",
      this.getMissionTelemetry.bind(this)
    );
  }

  private async startMission(req: Request, res: Response): Promise<void> {
    try {
      const mission = await missionService.createMission();
      res.status(201).json({
        success: true,
        mission: {
          missionId: mission.missionId,
          status: mission.status,
          startTime: mission.startTime,
        },
      });
    } catch (error) {
      console.error("Error creating mission:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create mission",
      });
    }
  }

  private async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const missions = await missionService.getAllMissions();
      const activeMissions = missions.filter(
        (m) => m.status === DroneStatus.IN_MISSION
      );

      res.status(200).json({
        totalMissions: missions.length,
        activeMissions: activeMissions.length,
        connectedClients: missionService.getAllConnectedClientsCount(),
      });
    } catch (error) {
      console.error("Error getting status:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get status",
      });
    }
  }

  private async getAllMissions(req: Request, res: Response): Promise<void> {
    try {
      const missions = await missionService.getAllMissions();
      res.status(200).json({
        success: true,
        missions: missions.map((mission) => ({
          missionId: mission.missionId,
          status: mission.status,
          startTime: mission.startTime,
          createdAt: mission.createdAt,
        })),
      });
    } catch (error) {
      console.error("Error getting missions:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get missions",
      });
    }
  }

  private async getMission(req: Request, res: Response): Promise<void> {
    try {
      const { missionId } = req.params;
      const mission = await missionService.getMission(missionId);

      if (!mission) {
        res.status(404).json({
          success: false,
          error: "Mission not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        mission: {
          missionId: mission.missionId,
          status: mission.status,
          startTime: mission.startTime,
          endTime: mission.endTime,
          totalFlightTime: mission.totalFlightTime,
          createdAt: mission.createdAt,
          connectedClients: missionService.getConnectedClientsCount(missionId),
        },
      });
    } catch (error) {
      console.error("Error getting mission:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get mission",
      });
    }
  }

  private async endMission(req: Request, res: Response): Promise<void> {
    try {
      const { missionId } = req.params;
      const mission = await missionService.getMission(missionId);

      if (!mission) {
        res.status(404).json({
          success: false,
          error: "Mission not found",
        });
        return;
      }

      if (mission.status === DroneStatus.COMPLETED) {
        res.status(400).json({
          success: false,
          error: "Mission is already completed",
        });
        return;
      }

      const endedMission = await missionService.endMission(missionId);

      res.status(200).json({
        success: true,
        message: "Mission ended successfully",
        mission: {
          missionId: endedMission?.missionId,
          status: endedMission?.status,
          endTime: endedMission?.endTime,
          totalFlightTime: endedMission?.totalFlightTime,
        },
      });
    } catch (error) {
      console.error("Error ending mission:", error);
      res.status(500).json({
        success: false,
        error: "Failed to end mission",
      });
    }
  }

  private async getMissionTelemetry(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { missionId } = req.params;
      const limit = parseInt(req.query.limit as string) || 100;

      const mission = await missionService.getMission(missionId);
      if (!mission) {
        res.status(404).json({
          success: false,
          error: "Mission not found",
        });
        return;
      }

      const telemetryHistory = await missionService.getTelemetryHistory(
        missionId,
        limit
      );

      res.status(200).json({
        success: true,
        missionId,
        count: telemetryHistory.length,
        telemetry: telemetryHistory.map((t) => ({
          timestamp: t.timestamp,
          battery: t.battery,
          latitude: t.latitude,
          longitude: t.longitude,
          altitude: t.altitude,
        })),
      });
    } catch (error) {
      console.error("Error getting mission telemetry:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get mission telemetry",
      });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
