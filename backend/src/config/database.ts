import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/live-telemetry";

export class Database {
  private static instance: Database;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log("MongoDB already connected");
      return;
    }

    try {
      await mongoose.connect(MONGODB_URI);
      this.isConnected = true;
      console.log("MongoDB connected successfully");

      mongoose.connection.on("error", (error) => {
        console.error("MongoDB connection error:", error);
        this.isConnected = false;
      });

      mongoose.connection.on("disconnected", () => {
        console.log("MongoDB disconnected");
        this.isConnected = false;
      });

      process.on("SIGINT", async () => {
        await this.disconnect();
        process.exit(0);
      });
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log("MongoDB disconnected successfully");
    } catch (error) {
      console.error("Error disconnecting from MongoDB:", error);
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export default Database.getInstance();
