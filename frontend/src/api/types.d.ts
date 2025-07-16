import { DroneStatus } from "@/enums/mission-status";

export interface StartMissionResponseType {
  mission: MissionType;
  success: boolean;
}

export interface MissionType {
  missionId: string;
  status: DroneStatus;
  startTime: string;
  endTime?: string;
  totalFlightTime?: number;
}

export interface GetAllMissionsResponseType {
  missions: MissionType[];
  success: boolean;
}

export interface TelemetryData {
  altitude: number;
  battery: number;
  latitude: number;
  longitude: number;
}

export interface TelemetryHistoryData {
  timestamp: string;
  battery: number;
  latitude: number;
  longitude: number;
  altitude: number;
}

export interface GetMissionTelemetryResponseType {
  success: boolean;
  missionId: string;
  count: number;
  telemetry: TelemetryHistoryData[];
}

export interface EndMissionResponseType {
  mission: MissionType;
  success: boolean;
}
