import mongoose from "mongoose";
import Mission, { IMission } from "../../src/models/Mission";
import { DroneStatus } from "../../src/enums";

describe("Mission Model", () => {
  describe("Mission Schema", () => {
    it("should create a mission with required fields", async () => {
      const missionData = {
        missionId: "test_mission_123",
        startTime: new Date(),
        status: DroneStatus.IN_MISSION,
      };

      const mission = new Mission(missionData);
      const savedMission = await mission.save();

      expect(savedMission.missionId).toBe(missionData.missionId);
      expect(savedMission.startTime).toEqual(missionData.startTime);
      expect(savedMission.status).toBe(missionData.status);
      expect(savedMission.endTime).toBeUndefined();
      expect(savedMission.totalFlightTime).toBe(0);
      expect(savedMission.createdAt).toBeDefined();
      expect(savedMission.updatedAt).toBeDefined();
    });

    it("should create a mission with default values", async () => {
      const missionData = {
        missionId: "test_mission_default",
        startTime: new Date(),
      };

      const mission = new Mission(missionData);
      const savedMission = await mission.save();

      expect(savedMission.status).toBe(DroneStatus.IN_MISSION);
      expect(savedMission.totalFlightTime).toBe(0);
    });

    it("should create a completed mission with all fields", async () => {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + 3600000); // 1 hour later

      const missionData = {
        missionId: "test_mission_completed",
        startTime,
        endTime,
        status: DroneStatus.COMPLETED,
        totalFlightTime: 3600,
      };

      const mission = new Mission(missionData);
      const savedMission = await mission.save();

      expect(savedMission.missionId).toBe(missionData.missionId);
      expect(savedMission.startTime).toEqual(startTime);
      expect(savedMission.endTime).toEqual(endTime);
      expect(savedMission.status).toBe(DroneStatus.COMPLETED);
      expect(savedMission.totalFlightTime).toBe(3600);
    });
  });

  describe("Mission Validation", () => {
    it("should require missionId", async () => {
      const missionData = {
        startTime: new Date(),
        status: DroneStatus.IN_MISSION,
      };

      const mission = new Mission(missionData);
      let error;

      try {
        await mission.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.missionId).toBeDefined();
    });

    it("should require startTime", async () => {
      const missionData = {
        missionId: "test_mission_no_start",
        status: DroneStatus.IN_MISSION,
      };

      const mission = new Mission(missionData);
      let error;

      try {
        await mission.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.startTime).toBeDefined();
    });

    it("should validate status enum values", async () => {
      const missionData = {
        missionId: "test_mission_invalid_status",
        startTime: new Date(),
        status: "invalid_status",
      };

      const mission = new Mission(missionData);
      let error;

      try {
        await mission.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.status).toBeDefined();
    });

    it("should accept valid status values", async () => {
      const validStatuses = Object.values(DroneStatus);

      for (const status of validStatuses) {
        const missionData = {
          missionId: `test_mission_${status}`,
          startTime: new Date(),
          status,
        };

        const mission = new Mission(missionData);
        const savedMission = await mission.save();

        expect(savedMission.status).toBe(status);
      }
    });
  });

  describe("Mission Indexes", () => {
    it("should enforce unique missionId", async () => {
      const missionData = {
        missionId: "duplicate_mission_id",
        startTime: new Date(),
        status: DroneStatus.IN_MISSION,
      };

      // Save first mission
      const mission1 = new Mission(missionData);
      await mission1.save();

      // Try to save second mission with same missionId
      const mission2 = new Mission(missionData);
      let error;

      try {
        await mission2.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.code).toBe(11000); // MongoDB duplicate key error
    });
  });

  describe("Mission Queries", () => {
    beforeEach(async () => {
      // Create test missions
      await Mission.create([
        {
          missionId: "mission_1",
          startTime: new Date(),
          status: DroneStatus.IN_MISSION,
        },
        {
          missionId: "mission_2",
          startTime: new Date(),
          status: DroneStatus.COMPLETED,
        },
        {
          missionId: "mission_3",
          startTime: new Date(),
          status: DroneStatus.IN_MISSION,
        },
      ]);
    });

    it("should find mission by missionId", async () => {
      const mission = await Mission.findOne({ missionId: "mission_1" });
      expect(mission).toBeDefined();
      expect(mission?.missionId).toBe("mission_1");
    });

    it("should find missions by status", async () => {
      const activeMissions = await Mission.find({
        status: DroneStatus.IN_MISSION,
      });
      expect(activeMissions).toHaveLength(2);

      const completedMissions = await Mission.find({
        status: DroneStatus.COMPLETED,
      });
      expect(completedMissions).toHaveLength(1);
    });

    it("should sort missions by creation date", async () => {
      const missions = await Mission.find().sort({ createdAt: -1 });
      expect(missions[0].createdAt.getTime()).toBeGreaterThanOrEqual(
        missions[1].createdAt.getTime()
      );
    });
  });

  describe("Mission Updates", () => {
    let testMission: IMission;

    beforeEach(async () => {
      testMission = await Mission.create({
        missionId: "test_mission_update",
        startTime: new Date(),
        status: DroneStatus.IN_MISSION,
      });
    });

    it("should update mission status", async () => {
      const updatedMission = await Mission.findOneAndUpdate(
        { missionId: testMission.missionId },
        { status: DroneStatus.COMPLETED },
        { new: true }
      );

      expect(updatedMission?.status).toBe(DroneStatus.COMPLETED);
    });

    it("should update endTime and totalFlightTime", async () => {
      const endTime = new Date();
      const totalFlightTime = 3600;

      const updatedMission = await Mission.findOneAndUpdate(
        { missionId: testMission.missionId },
        {
          endTime,
          totalFlightTime,
          status: DroneStatus.COMPLETED,
        },
        { new: true }
      );

      expect(updatedMission?.endTime).toEqual(endTime);
      expect(updatedMission?.totalFlightTime).toBe(totalFlightTime);
    });
  });
});
