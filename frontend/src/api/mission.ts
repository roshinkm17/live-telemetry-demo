import api from "@/lib/axios";
import type {
  EndMissionResponseType,
  GetAllMissionsResponseType,
  StartMissionResponseType,
  GetMissionTelemetryResponseType,
} from "./types";

export const startMission = async () => {
  const response = await api.post<StartMissionResponseType>(
    "/api/start-mission"
  );
  return response.data.mission;
};

export const getAllMissions = async () => {
  const response = await api.get<GetAllMissionsResponseType>("/api/missions");
  return response.data.missions;
};

export const endMission = async (missionId: string) => {
  const response = await api.post<EndMissionResponseType>(
    `/api/missions/${missionId}/end`
  );
  return response.data.mission;
};

export const getMission = async (missionId: string) => {
  const response = await api.get<StartMissionResponseType>(
    `/api/missions/${missionId}`
  );
  return response.data.mission;
};

export const getMissionTelemetry = async (
  missionId: string,
  limit?: number
) => {
  const params = limit ? { limit: limit.toString() } : {};
  const response = await api.get<GetMissionTelemetryResponseType>(
    `/api/missions/${missionId}/telemetry`,
    { params }
  );
  return response.data.telemetry;
};
