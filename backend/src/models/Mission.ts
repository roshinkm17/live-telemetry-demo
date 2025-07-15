import mongoose, { Document, Schema } from "mongoose";
import { DroneStatus } from "../enums";

export interface IMission extends Document {
  missionId: string;
  startTime: Date;
  endTime?: Date;
  status: DroneStatus;
  totalFlightTime?: number; // in seconds
  createdAt: Date;
  updatedAt: Date;
}

const MissionSchema: Schema = new Schema(
  {
    missionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endTime: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(DroneStatus),
      required: true,
      default: DroneStatus.IN_MISSION,
    },
    totalFlightTime: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IMission>("Mission", MissionSchema);
