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

export interface EndMissionResponseType {
  mission: MissionType;
  success: boolean;
}
