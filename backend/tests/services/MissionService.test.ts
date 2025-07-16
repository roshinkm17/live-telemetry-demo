import { MissionService } from "../../src/services/MissionService";
import { DroneStatus } from "../../src/enums";
import Mission from "../../src/models/Mission";
import TelemetryHistory from "../../src/models/TelemetryHistory";

describe("MissionService", () => {
  let missionService: MissionService;

  beforeEach(() => {
    missionService = new MissionService();
  });

  afterEach(async () => {
    // Clean up any running intervals
    missionService.cleanup();
  });

  describe("createMission", () => {
    it("should create a new mission with correct properties", async () => {
      const mission = await missionService.createMission();

      expect(mission).toBeDefined();
      expect(mission.missionId).toContain("MISSION_");
      expect(mission.status).toBe(DroneStatus.IN_MISSION);
      expect(mission.startTime).toBeInstanceOf(Date);
    });

    it("should generate unique mission IDs", async () => {
      const mission1 = await missionService.createMission();
      const mission2 = await missionService.createMission();

      expect(mission1.missionId).not.toBe(mission2.missionId);
    });

    it("should save mission to database", async () => {
      const mission = await missionService.createMission();

      const savedMission = await Mission.findOne({
        missionId: mission.missionId,
      });
      expect(savedMission).toBeDefined();
      expect(savedMission?.missionId).toBe(mission.missionId);
    });
  });

  describe("getMission", () => {
    it("should return mission for valid mission ID", async () => {
      const createdMission = await missionService.createMission();
      const retrievedMission = await missionService.getMission(
        createdMission.missionId
      );

      expect(retrievedMission).toBeDefined();
      expect(retrievedMission?.missionId).toBe(createdMission.missionId);
    });

    it("should return null for non-existent mission", async () => {
      const mission = await missionService.getMission("non_existent_mission");
      expect(mission).toBeNull();
    });
  });

  describe("getAllMissions", () => {
    it("should return all missions in correct order", async () => {
      const mission1 = await missionService.createMission();
      const mission2 = await missionService.createMission();

      const allMissions = await missionService.getAllMissions();

      expect(allMissions).toHaveLength(2);
      expect(allMissions[0].createdAt.getTime()).toBeGreaterThanOrEqual(
        allMissions[1].createdAt.getTime()
      );
    });

    it("should return empty array when no missions exist", async () => {
      const missions = await missionService.getAllMissions();
      expect(missions).toHaveLength(0);
    });
  });

  describe("updateMissionStatus", () => {
    let testMission: any;

    beforeEach(async () => {
      testMission = await missionService.createMission();
    });

    it("should update mission status", async () => {
      const updatedMission = await missionService.updateMissionStatus(
        testMission.missionId,
        DroneStatus.COMPLETED
      );

      expect(updatedMission?.status).toBe(DroneStatus.COMPLETED);
    });

    it("should set endTime and totalFlightTime when completing mission", async () => {
      // Wait a bit to ensure some time has passed
      await new Promise((resolve) => setTimeout(resolve, 100));

      const updatedMission = await missionService.updateMissionStatus(
        testMission.missionId,
        DroneStatus.COMPLETED
      );

      expect(updatedMission?.endTime).toBeDefined();
      expect(updatedMission?.totalFlightTime).toBe(0);
    });

    it("should return null for non-existent mission", async () => {
      const result = await missionService.updateMissionStatus(
        "non_existent_mission",
        DroneStatus.COMPLETED
      );

      expect(result).toBeNull();
    });
  });

  describe("endMission", () => {
    let testMission: any;

    beforeEach(async () => {
      testMission = await missionService.createMission();
    });

    it("should end mission and stop telemetry updates", async () => {
      const endedMission = await missionService.endMission(
        testMission.missionId
      );

      expect(endedMission?.status).toBe(DroneStatus.COMPLETED);
      expect(endedMission?.endTime).toBeDefined();
      expect(endedMission?.totalFlightTime).toBe(0);
    });

    it("should return null for non-existent mission", async () => {
      const result = await missionService.endMission("non_existent_mission");
      expect(result).toBeNull();
    });
  });

  describe("getTelemetryHistory", () => {
    let testMission: any;

    beforeEach(async () => {
      testMission = await missionService.createMission();

      // Create some test telemetry data
      await TelemetryHistory.create([
        {
          missionId: testMission.missionId,
          timestamp: new Date(),
          battery: 85,
          latitude: 37.7749,
          longitude: -122.4194,
          altitude: 100.5,
        },
        {
          missionId: testMission.missionId,
          timestamp: new Date(),
          battery: 80,
          latitude: 37.775,
          longitude: -122.4195,
          altitude: 105.2,
        },
      ]);
    });

    it("should return telemetry history for mission", async () => {
      const telemetry = await missionService.getTelemetryHistory(
        testMission.missionId
      );

      expect(telemetry).toHaveLength(2);
      expect(telemetry[0]).toHaveProperty("battery");
      expect(telemetry[0]).toHaveProperty("latitude");
      expect(telemetry[0]).toHaveProperty("longitude");
      expect(telemetry[0]).toHaveProperty("altitude");
    });

    it("should respect limit parameter", async () => {
      const telemetry = await missionService.getTelemetryHistory(
        testMission.missionId,
        1
      );

      expect(telemetry).toHaveLength(1);
    });

    it("should return empty array for mission with no telemetry", async () => {
      const newMission = await missionService.createMission();
      const telemetry = await missionService.getTelemetryHistory(
        newMission.missionId
      );

      expect(telemetry).toHaveLength(0);
    });
  });

  describe("WebSocket management", () => {
    let testMission: any;
    let mockWebSocket: any;

    beforeEach(async () => {
      testMission = await missionService.createMission();
      mockWebSocket = {
        readyState: 1, // WebSocket.OPEN
        send: jest.fn(),
        on: jest.fn(),
        close: jest.fn(),
      };
    });

    it("should add WebSocket to mission", () => {
      missionService.addWebSocketToMission(
        testMission.missionId,
        mockWebSocket
      );

      const connectedClients = missionService.getConnectedClientsCount(
        testMission.missionId
      );
      expect(connectedClients).toBe(1);
    });

    it("should remove WebSocket from mission", () => {
      missionService.addWebSocketToMission(
        testMission.missionId,
        mockWebSocket
      );
      missionService.removeWebSocketFromMission(
        testMission.missionId,
        mockWebSocket
      );

      const connectedClients = missionService.getConnectedClientsCount(
        testMission.missionId
      );
      expect(connectedClients).toBe(0);
    });

    it("should return correct connected clients count", () => {
      const mockWs1 = { ...mockWebSocket };
      const mockWs2 = { ...mockWebSocket };

      missionService.addWebSocketToMission(testMission.missionId, mockWs1);
      missionService.addWebSocketToMission(testMission.missionId, mockWs2);

      const count = missionService.getConnectedClientsCount(
        testMission.missionId
      );
      expect(count).toBe(2);
    });

    it("should return total connected clients count", () => {
      const mockWs1 = { ...mockWebSocket };
      const mockWs2 = { ...mockWebSocket };

      missionService.addWebSocketToMission(testMission.missionId, mockWs1);
      missionService.addWebSocketToMission(testMission.missionId, mockWs2);

      const totalCount = missionService.getAllConnectedClientsCount();
      expect(totalCount).toBe(2);
    });
  });

  describe("cleanup", () => {
    it("should clean up resources", () => {
      expect(() => {
        missionService.cleanup();
      }).not.toThrow();
    });
  });
});
