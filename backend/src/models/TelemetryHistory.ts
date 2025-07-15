import mongoose, { Document, Schema } from "mongoose";

export interface ITelemetryHistory extends Document {
  missionId: string;
  timestamp: Date;
  battery: number;
  latitude: number;
  longitude: number;
  altitude: number;
  createdAt: Date;
}

const TelemetryHistorySchema: Schema = new Schema(
  {
    missionId: {
      type: String,
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    battery: {
      type: Number,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    altitude: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

TelemetryHistorySchema.index({ missionId: 1, timestamp: -1 });

export default mongoose.model<ITelemetryHistory>(
  "TelemetryHistory",
  TelemetryHistorySchema
);
