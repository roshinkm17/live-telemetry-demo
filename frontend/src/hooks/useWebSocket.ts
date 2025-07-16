import type { TelemetryData } from "@/api/types";
import { useEffect, useRef, useState } from "react";

interface WebSocketMessage {
  type: string;
  message: string;
  missionId?: string;
  data?: TelemetryData;
  endTime?: string;
  totalFlightTime?: number;
  status?: string;
}

export const useWebSocket = (missionId: string) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<TelemetryData | null>(null);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [missionEnded, setMissionEnded] = useState(false);

  const disconnect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close();
      console.log("WebSocket manually disconnected");
    }
  };

  useEffect(() => {
    if (!missionId) return;

    const ws = new WebSocket("ws://localhost:3001");
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected ✅");
      setIsConnected(true);

      const subscribeMessage = {
        type: "subscribe",
        missionId: missionId,
      };
      ws.send(JSON.stringify(subscribeMessage));
      console.log(`Subscribed to mission: ${missionId}`);
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        console.log("WebSocket message received:", message);

        if (message.type === "subscribed") {
          console.log("Successfully subscribed to mission telemetry");
        } else if (message.type === "telemetry") {
          console.log("Telemetry data received:", message.data);
          setLastMessage(message.data || null);

          // Update battery level
          if (message.data?.battery !== undefined) {
            setBatteryLevel(message.data.battery);
            console.log(`Battery level: ${message.data.battery}%`);
          }
        } else if (message.type === "battery_depleted") {
          console.log(
            "Battery depleted - mission automatically ended:",
            message
          );
          setMissionEnded(true);
          setIsConnected(false);
          // The backend has already ended the mission, so we just need to update UI
        } else if (message.type === "error") {
          console.error("WebSocket error:", message.message);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected ❌");
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [missionId]);

  return {
    isConnected,
    lastMessage,
    batteryLevel,
    missionEnded,
    disconnect,
    sendMessage: (message: WebSocketMessage) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(message));
      }
    },
  };
};
