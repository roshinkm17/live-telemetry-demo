import { DroneStatus } from "./enums";

export interface Telemetry {
  battery: number;
  latitude: number;
  longitude: number;
  altitude: number;
  status: DroneStatus;
}
