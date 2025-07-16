import type { MissionCompletionReason } from "@/constants/mission";

export interface MissionCompletionData {
  endTime: string;
  totalFlightTime: number;
  status: string;
  reason?: MissionCompletionReason;
}
