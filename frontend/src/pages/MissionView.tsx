import { useParams, useNavigate } from "react-router-dom";
import TelemetryMapData from "../components/telemetry-data";
import { useWebSocket } from "../hooks/useWebSocket";
import {
  useEndMission,
  useGetMission,
  useGetMissionTelemetry,
} from "../hooks/useMission";
import { useState, useEffect, useCallback } from "react";
import { DroneStatus } from "@/enums/mission-status";
import type { MissionCompletionData } from "./types";
import { BackButton } from "@/components/back-button";
import { NotFound } from "@/components/404";
import { Badge } from "@/components/ui/badge";
import {
  Battery,
  BatteryLow,
  BatteryWarning,
  BatteryMedium,
  BatteryFull,
  Check,
  Copy,
  Wifi,
  WifiOff,
} from "lucide-react";
import { formatDate, formatDuration } from "@/lib/date-utils";
import { MISSION_COMPLETION_REASONS } from "@/constants/mission";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const MissionView = () => {
  const { missionId } = useParams<{ missionId: string }>();
  const navigate = useNavigate();
  const { mutateAsync: endMission } = useEndMission();
  const [isCopied, setIsCopied] = useState(false);
  const { data: mission, isLoading } = useGetMission(missionId || "");
  const [missionCompleted, setMissionCompleted] =
    useState<MissionCompletionData | null>(null);
  const [lowBatteryToastShown, setLowBatteryToastShown] = useState(false);

  // Fetch telemetry history for completed missions
  const { data: telemetryHistory } = useGetMissionTelemetry(
    missionId || "",
    mission?.status === DroneStatus.COMPLETED ? 1000 : undefined
  );

  const shouldConnectWebSocket =
    mission && mission.status !== DroneStatus.COMPLETED;
  const { isConnected, lastMessage, batteryLevel, missionEnded, disconnect } =
    useWebSocket(shouldConnectWebSocket ? missionId || "" : "");

  useEffect(() => {
    if (mission?.status === DroneStatus.COMPLETED) {
      setMissionCompleted({
        endTime: mission.endTime || new Date().toISOString(),
        totalFlightTime: mission.totalFlightTime || 0,
        status: mission.status,
        reason: MISSION_COMPLETION_REASONS.PREVIOUSLY_COMPLETED,
      });
    }
  }, [mission]);

  useEffect(() => {
    if (
      shouldConnectWebSocket &&
      batteryLevel !== null &&
      batteryLevel <= 25 &&
      !lowBatteryToastShown &&
      !missionCompleted
    ) {
      toast.error("Low Battery", {
        description: `Battery level is at ${batteryLevel.toFixed(
          1
        )}%. Mission may end soon.`,
        duration: Infinity,
        dismissible: true,
        icon: <BatteryWarning className="w-4 h-4" />,
      });
      setLowBatteryToastShown(true);
    }
  }, [
    batteryLevel,
    shouldConnectWebSocket,
    lowBatteryToastShown,
    missionCompleted,
  ]);

  useEffect(() => {
    if (missionEnded && !missionCompleted) {
      setMissionCompleted({
        endTime: new Date().toISOString(),
        totalFlightTime: 0,
        status: "COMPLETED",
        reason: MISSION_COMPLETION_REASONS.BATTERY_DEPLETED,
      });
    }
  }, [missionEnded, missionCompleted]);

  const handleEndMission = useCallback(async () => {
    if (!missionId) return;

    try {
      disconnect();
      const result = await endMission(missionId);
      setMissionCompleted({
        endTime: result.endTime ?? "",
        totalFlightTime: result.totalFlightTime ?? 0,
        status: result.status,
        reason: MISSION_COMPLETION_REASONS.MANUALLY_ENDED,
      });
      console.log("Mission ended successfully:", result);
    } catch (error) {
      console.error("Failed to end mission:", error);
    }
  }, [missionId, endMission, disconnect]);

  const getBatteryIcon = (level: number | null) => {
    if (level === null) return Battery;
    if (level <= 10) return BatteryLow;
    if (level <= 25) return BatteryWarning;
    if (level <= 50) return BatteryMedium;
    return BatteryFull;
  };

  const handleBackToDashboard = () => {
    if (shouldConnectWebSocket && isConnected) disconnect();
    navigate("/");
  };

  const handleCopyMissionId = () => {
    navigator.clipboard.writeText(missionId || "");
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
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
      <NotFound
        handleBackToDashboard={handleBackToDashboard}
        missionId={missionId}
      />
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center gap-4 mb-8">
        <BackButton handleBackToDashboard={handleBackToDashboard} />
        <h1 className="text-3xl font-bold font-mono">{missionId}</h1>
      </div>

      <div className="grid gap-8 grid-cols-4">
        <div className="col-span-3 flex flex-col gap-4">
          <TelemetryMapData
            latitude={lastMessage?.latitude ?? 0}
            longitude={lastMessage?.longitude ?? 0}
            altitude={lastMessage?.altitude ?? 0}
            battery={lastMessage?.battery ?? 0}
            telemetryHistory={telemetryHistory}
            showFlightPath={mission?.status === DroneStatus.COMPLETED}
            isLiveData={mission?.status === DroneStatus.IN_MISSION}
          />
        </div>
        <div className="col-span-1 font-mono">
          <div className="p-4 border rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Mission Details</h2>
            <p className="text-sm text-gray-600 mb-4 flex items-center gap-2">
              {missionId}{" "}
              {isCopied ? (
                <Check className="w-4 h-4 cursor-pointer" />
              ) : (
                <Copy
                  className="w-4 h-4 cursor-pointer"
                  onClick={handleCopyMissionId}
                />
              )}
            </p>

            {missionCompleted ? (
              <div className="space-y-3">
                <Badge className="font-bold bg-green-100 text-green-800 hover:bg-green-200">
                  Mission Completed
                </Badge>
                <div className="space-y-2 text-sm">
                  <DataItem
                    label="Ended at"
                    value={formatDate(missionCompleted.endTime)}
                  />
                  <DataItem
                    label="Total Flight Time"
                    value={formatDuration(missionCompleted.totalFlightTime)}
                  />
                  <MissionCompleted missionCompleted={missionCompleted} />
                </div>
              </div>
            ) : (
              <div className="flex flex-row gap-2 h-fit">
                {shouldConnectWebSocket && (
                  <Badge
                    variant="secondary"
                    className={`px-2 py-1 flex items-center gap-2 w-fit ${
                      isConnected
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {isConnected ? (
                      <Wifi className="w-4 h-4" />
                    ) : (
                      <WifiOff className="w-4 h-4" />
                    )}
                    {isConnected ? "Connected" : "Disconnected"}
                  </Badge>
                )}
                <Badge
                  variant="secondary"
                  className={`px-2 py-1 flex items-center gap-2 w-fit ${
                    batteryLevel && batteryLevel <= 25
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {(() => {
                    const BatteryIcon = getBatteryIcon(batteryLevel);
                    return <BatteryIcon className="w-4 h-4" />;
                  })()}
                  {Math.round(batteryLevel ?? 0)}%
                </Badge>
              </div>
            )}
            {lastMessage && shouldConnectWebSocket && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Latest Telemetry</h3>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                  {JSON.stringify(lastMessage, null, 2)}
                </pre>
              </div>
            )}
            {!missionCompleted && (
              <Button
                variant="destructive"
                className="w-full mt-4"
                onClick={handleEndMission}
              >
                End Mission
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MissionCompleted = ({
  missionCompleted,
}: {
  missionCompleted: MissionCompletionData;
}) => {
  return (
    <>
      {missionCompleted.reason ===
        MISSION_COMPLETION_REASONS.BATTERY_DEPLETED && (
        <p className="text-red-600 font-medium">
          ⚠️ Mission ended due to battery depletion
        </p>
      )}
      {missionCompleted.reason ===
        MISSION_COMPLETION_REASONS.MANUALLY_ENDED && (
        <p className="text-blue-600 font-medium">✅ Mission manually ended</p>
      )}
      {missionCompleted.reason ===
        MISSION_COMPLETION_REASONS.PREVIOUSLY_COMPLETED && (
        <p className="text-gray-600 font-medium">
          📋 Mission was already completed
        </p>
      )}
    </>
  );
};

const DataItem = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="flex items-center gap-2 justify-between">
      <strong className="font-bold">{label}:</strong>
      <span className="font-mono text-right">{value}</span>
    </div>
  );
};

export default MissionView;
