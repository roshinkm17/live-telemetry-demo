import express from "express";
import request from "supertest";
import { DroneRoutes } from "../src/routes";
import { DroneStatus } from "../src/enums";
import Mission from "../src/models/Mission";
import TelemetryHistory from "../src/models/TelemetryHistory";
import {
  createTestServer,
  closeTestServer,
  TestServer,
} from "./utils/testUtils";

describe("DroneRoutes", () => {
  let testServer: TestServer;
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    const droneRoutes = new DroneRoutes();
    app.use("/api", droneRoutes.getRouter());

    testServer = createTestServer(app);
  });

  afterAll(async () => {
    await closeTestServer(testServer.server);
  });

  describe("POST /api/start-mission", () => {
    it("should create a new mission successfully", async () => {
      const response = await request(app)
        .post("/api/start-mission")
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.mission).toHaveProperty("missionId");
      expect(response.body.mission).toHaveProperty(
        "status",
        DroneStatus.IN_MISSION
      );
      expect(response.body.mission).toHaveProperty("startTime");
      expect(response.body.mission.missionId).toContain("MISSION_");
    });

    it("should return mission with correct structure", async () => {
      const response = await request(app)
        .post("/api/start-mission")
        .expect(201);

      const mission = response.body.mission;
      expect(mission).toMatchObject({
        status: DroneStatus.IN_MISSION,
      });
      expect(new Date(mission.startTime)).toBeInstanceOf(Date);
    });
  });

  describe("GET /api/missions", () => {
    beforeEach(async () => {
      // Create test missions
      await Mission.create([
        {
          missionId: "test_mission_1",
          startTime: new Date(),
          status: DroneStatus.IN_MISSION,
        },
        {
          missionId: "test_mission_2",
          startTime: new Date(),
          status: DroneStatus.COMPLETED,
        },
      ]);
    });

    it("should return all missions", async () => {
      const response = await request(app).get("/api/missions").expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.missions).toBeInstanceOf(Array);
      expect(response.body.missions).toHaveLength(2);
      expect(response.body.missions[0]).toHaveProperty("missionId");
      expect(response.body.missions[0]).toHaveProperty("status");
      expect(response.body.missions[0]).toHaveProperty("startTime");
      expect(response.body.missions[0]).toHaveProperty("createdAt");
    });
  });

  describe("GET /api/missions/:missionId", () => {
    let testMission: any;

    beforeEach(async () => {
      testMission = await Mission.create({
        missionId: "test_mission_123",
        startTime: new Date(),
        status: DroneStatus.IN_MISSION,
      });
    });

    it("should return mission details for valid mission ID", async () => {
      const response = await request(app)
        .get("/api/missions/test_mission_123")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.mission).toMatchObject({
        missionId: "test_mission_123",
        status: DroneStatus.IN_MISSION,
      });
      expect(response.body.mission).toHaveProperty("startTime");
      expect(response.body.mission).toHaveProperty("endTime");
      expect(response.body.mission).toHaveProperty("totalFlightTime");
      expect(response.body.mission).toHaveProperty("createdAt");
      expect(response.body.mission).toHaveProperty("connectedClients");
    });

    it("should return 404 for non-existent mission", async () => {
      const response = await request(app)
        .get("/api/missions/non_existent_mission")
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Mission not found");
    });
  });

  describe("POST /api/missions/:missionId/end", () => {
    let testMission: any;

    beforeEach(async () => {
      testMission = await Mission.create({
        missionId: "test_mission_end",
        startTime: new Date(Date.now() - 3600000), // 1 hour ago
        status: DroneStatus.IN_MISSION,
      });
    });

    it("should end mission successfully", async () => {
      const response = await request(app)
        .post("/api/missions/test_mission_end/end")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Mission ended successfully");
      expect(response.body.mission).toMatchObject({
        missionId: "test_mission_end",
        status: DroneStatus.COMPLETED,
      });
      expect(response.body.mission).toHaveProperty("endTime");
      expect(response.body.mission).toHaveProperty("totalFlightTime");
      expect(response.body.mission.totalFlightTime).toBeGreaterThan(0);
    });

    it("should return 404 for non-existent mission", async () => {
      const response = await request(app)
        .post("/api/missions/non_existent_mission/end")
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Mission not found");
    });

    it("should return 400 for already completed mission", async () => {
      // First end the mission
      await request(app).post("/api/missions/test_mission_end/end").expect(200);

      // Try to end it again
      const response = await request(app)
        .post("/api/missions/test_mission_end/end")
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Mission is already completed");
    });
  });

  describe("GET /api/missions/:missionId/telemetry", () => {
    let testMission: any;

    beforeEach(async () => {
      testMission = await Mission.create({
        missionId: "test_mission_telemetry",
        startTime: new Date(),
        status: DroneStatus.IN_MISSION,
      });

      // Create test telemetry data
      await TelemetryHistory.create([
        {
          missionId: "test_mission_telemetry",
          timestamp: new Date(),
          battery: 85,
          latitude: 37.7749,
          longitude: -122.4194,
          altitude: 100.5,
        },
        {
          missionId: "test_mission_telemetry",
          timestamp: new Date(),
          battery: 80,
          latitude: 37.775,
          longitude: -122.4195,
          altitude: 105.2,
        },
      ]);
    });

    it("should return telemetry data for valid mission", async () => {
      const response = await request(app)
        .get("/api/missions/test_mission_telemetry/telemetry")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.missionId).toBe("test_mission_telemetry");
      expect(response.body.count).toBe(2);
      expect(response.body.telemetry).toBeInstanceOf(Array);
      expect(response.body.telemetry).toHaveLength(2);
      expect(response.body.telemetry[0]).toHaveProperty("timestamp");
      expect(response.body.telemetry[0]).toHaveProperty("battery");
      expect(response.body.telemetry[0]).toHaveProperty("latitude");
      expect(response.body.telemetry[0]).toHaveProperty("longitude");
      expect(response.body.telemetry[0]).toHaveProperty("altitude");
    });

    it("should respect limit parameter", async () => {
      const response = await request(app)
        .get("/api/missions/test_mission_telemetry/telemetry?limit=1")
        .expect(200);

      expect(response.body.telemetry).toHaveLength(1);
    });

    it("should return 404 for non-existent mission", async () => {
      const response = await request(app)
        .get("/api/missions/non_existent_mission/telemetry")
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Mission not found");
    });

    it("should return empty array for mission with no telemetry", async () => {
      const newMission = await Mission.create({
        missionId: "empty_mission",
        startTime: new Date(),
        status: DroneStatus.IN_MISSION,
      });

      const response = await request(app)
        .get("/api/missions/empty_mission/telemetry")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(0);
      expect(response.body.telemetry).toHaveLength(0);
    });
  });

  describe("GET /api/status", () => {
    beforeEach(async () => {
      // Create test missions
      await Mission.create([
        {
          missionId: "active_mission_1",
          startTime: new Date(),
          status: DroneStatus.IN_MISSION,
        },
        {
          missionId: "active_mission_2",
          startTime: new Date(),
          status: DroneStatus.IN_MISSION,
        },
        {
          missionId: "completed_mission",
          startTime: new Date(),
          status: DroneStatus.COMPLETED,
        },
      ]);
    });

    it("should return system status", async () => {
      const response = await request(app).get("/api/status").expect(200);

      expect(response.body).toHaveProperty("totalMissions");
      expect(response.body).toHaveProperty("activeMissions");
      expect(response.body).toHaveProperty("connectedClients");
      expect(response.body.totalMissions).toBe(3);
      expect(response.body.activeMissions).toBe(2);
      expect(typeof response.body.connectedClients).toBe("number");
    });
  });
});
