import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import TelemetryData from "../components/telemetry-data";
import { useWebSocket } from "../hooks/useWebSocket";
import { useEndMission, useGetMission } from "../hooks/useMission";
import { useState, useEffect } from "react";
import { DroneStatus } from "@/enums/mission-status";

interface MissionCompletionData {
  endTime: string;
  totalFlightTime: number;
  status: string;
  reason?: string;
}

function MissionView() {
  const { missionId } = useParams<{ missionId: string }>();
  const navigate = useNavigate();
  const endMission = useEndMission();
  const { data: mission, isLoading } = useGetMission(missionId || "");
  const [missionCompleted, setMissionCompleted] =
    useState<MissionCompletionData | null>(null);

  // Check if mission is already completed
  useEffect(() => {
    if (mission && mission.status === DroneStatus.COMPLETED) {
      setMissionCompleted({
        endTime: mission.endTime || new Date().toISOString(),
        totalFlightTime: mission.totalFlightTime || 0,
        status: mission.status,
        reason: "Previously completed",
      });
    }
  }, [mission]);

  const handleEndMission = async () => {
    if (!missionId) return;

    try {
      // Disconnect WebSocket first
      disconnect();

      // Call API to end mission
      const result = await endMission.mutateAsync(missionId);

      // Show completion data
      setMissionCompleted({
        endTime: result.endTime ?? "",
        totalFlightTime: result.totalFlightTime ?? 0,
        status: result.status,
        reason: "Manually ended",
      });

      console.log("Mission ended successfully:", result);
    } catch (error) {
      console.error("Failed to end mission:", error);
    }
  };

  // Only connect to WebSocket if mission is not completed
  const shouldConnectWebSocket =
    mission && mission.status !== DroneStatus.COMPLETED;

  const { isConnected, lastMessage, batteryLevel, missionEnded, disconnect } =
    useWebSocket(shouldConnectWebSocket ? missionId || "" : "");

  // Handle mission ended by backend (battery depletion)
  if (missionEnded && !missionCompleted) {
    setMissionCompleted({
      endTime: new Date().toISOString(),
      totalFlightTime: 0, // Will be updated from backend response
      status: "COMPLETED",
      reason: "Battery depleted",
    });
  }

  const getBatteryColor = (level: number | null) => {
    if (level === null) return "bg-gray-200";
    if (level <= 10) return "bg-red-500";
    if (level <= 25) return "bg-orange-500";
    if (level <= 50) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getBatteryTextColor = (level: number | null) => {
    if (level === null) return "text-gray-600";
    if (level <= 25) return "text-white";
    return "text-black";
  };

  // Only disconnect when user clicks Back to Dashboard
  const handleBackToDashboard = () => {
    if (shouldConnectWebSocket && isConnected) {
      disconnect();
    }
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading mission...</div>
        </div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={handleBackToDashboard}>
            ← Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Mission Not Found</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-600">
            Mission with ID "{missionId}" could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={handleBackToDashboard}>
          ← Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold">Mission: {missionId}</h1>

        {/* Only show connection status if mission is active */}
        {shouldConnectWebSocket && (
          <div
            className={`px-3 py-1 rounded-full text-sm ${
              isConnected
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
          </div>
        )}

        {/* Battery Indicator - only show if mission is active */}
        {shouldConnectWebSocket &&
          batteryLevel !== null &&
          !missionCompleted && (
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium">Battery:</div>
              <div
                className={`px-2 py-1 rounded text-xs font-bold ${getBatteryColor(
                  batteryLevel
                )} ${getBatteryTextColor(batteryLevel)}`}
              >
                {batteryLevel.toFixed(1)}%
              </div>
              {batteryLevel <= 10 && (
                <div className="text-red-600 text-sm font-medium animate-pulse">
                  ⚠️ Low Battery
                </div>
              )}
            </div>
          )}

        {/* End Mission Button - only show if mission is active */}
        {!missionCompleted &&
          shouldConnectWebSocket &&
          isConnected &&
          mission?.status === DroneStatus.IN_MISSION && (
            <Button
              variant="destructive"
              onClick={handleEndMission}
              disabled={endMission.isPending}
            >
              {endMission.isPending ? "Ending..." : "End Mission"}
            </Button>
          )}
      </div>

      <div className="grid gap-8 grid-cols-4">
        <div className="flex flex-col gap-4 col-span-3">
          <div className="flex flex-col gap-4">
            <TelemetryData />
          </div>
        </div>
        <div className="col-span-1">
          <div className="p-4 border rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Mission Details</h2>
            <p className="text-sm text-gray-600 mb-4">
              Mission ID: {missionId}
            </p>

            {missionCompleted ? (
              <div className="space-y-3">
                <h3 className="font-medium text-green-700">
                  Mission Completed
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Status:</strong> {missionCompleted.status}
                  </p>
                  <p>
                    <strong>End Time:</strong>{" "}
                    {new Date(missionCompleted.endTime).toLocaleString()}
                  </p>
                  <p>
                    <strong>Total Flight Time:</strong>{" "}
                    {missionCompleted.totalFlightTime} seconds
                  </p>
                  {missionCompleted.reason === "Battery depleted" && (
                    <p className="text-red-600 font-medium">
                      ⚠️ Mission ended due to battery depletion
                    </p>
                  )}
                  {missionCompleted.reason === "Manually ended" && (
                    <p className="text-blue-600 font-medium">
                      ✅ Mission manually ended
                    </p>
                  )}
                  {missionCompleted.reason === "Previously completed" && (
                    <p className="text-gray-600 font-medium">
                      📋 Mission was already completed
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="font-medium">Mission Status</h3>
                <p className="text-sm">Status: {mission.status}</p>

                {shouldConnectWebSocket && (
                  <>
                    <h3 className="font-medium mt-4">WebSocket Status</h3>
                    <p className="text-sm">
                      Status: {isConnected ? "Connected" : "Disconnected"}
                    </p>
                  </>
                )}

                {lastMessage && shouldConnectWebSocket && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Latest Telemetry</h3>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                      {JSON.stringify(lastMessage, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MissionView;
