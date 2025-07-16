import { Express } from "express";
import request from "supertest";
import { Server } from "http";

export interface TestServer {
  app: Express;
  server: Server;
}

export const createTestServer = (app: Express): TestServer => {
  const server = app.listen(0); // Use random port
  return { app, server };
};

export const closeTestServer = (server: Server): Promise<void> => {
  return new Promise((resolve) => {
    server.close(() => resolve());
  });
};

export const generateMockMission = (overrides = {}) => ({
  missionId: "test_mission_123",
  startTime: new Date(),
  status: "in_mission",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const generateMockTelemetry = (overrides = {}) => ({
  missionId: "test_mission_123",
  timestamp: new Date(),
  battery: 85,
  latitude: 37.7749,
  longitude: -122.4194,
  altitude: 100.5,
  ...overrides,
});
