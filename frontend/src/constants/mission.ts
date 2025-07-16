export const MISSION_COMPLETION_REASONS = {
  BATTERY_DEPLETED: "Battery depleted",
  MANUALLY_ENDED: "Manually ended",
  PREVIOUSLY_COMPLETED: "Previously completed",
} as const;

export type MissionCompletionReason =
  (typeof MISSION_COMPLETION_REASONS)[keyof typeof MISSION_COMPLETION_REASONS];
