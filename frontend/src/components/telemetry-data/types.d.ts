import type { TelemetryData, TelemetryHistoryData } from "@/api/types";

export interface TelemetryMapDataProps extends TelemetryData {
  telemetryHistory?: TelemetryHistoryData[];
  showFlightPath?: boolean;
}
