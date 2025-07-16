import type { MissionType } from "@/api/types";

import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { useGetAllMissions } from "@/hooks/useMission";
import { Badge } from "../ui/badge";
import { DroneStatus } from "@/enums/mission-status";

const MissionHistoryItem = ({ mission }: { mission: MissionType }) => {
  const navigate = useNavigate();

  const handleMissionClick = () => {
    navigate(`/mission/${mission.missionId}`);
  };

  return (
    <Button
      variant="ghost"
      onClick={handleMissionClick}
      className="w-full justify-start text-left"
    >
      <Badge
        variant={
          mission.status === DroneStatus.COMPLETED
            ? "destructive"
            : mission.status === DroneStatus.IN_MISSION
            ? "secondary"
            : "default"
        }
      >
        {mission.status}
      </Badge>
      {mission.missionId}
    </Button>
  );
};

const MissionHistory = () => {
  const { data: missions } = useGetAllMissions();

  return (
    <ul className="list-none divide-y divide-gray-200 border-l border-gray-200">
      <p className="p-2 font-sans text-sm border-b border-gray-200 font-bold">
        Mission History
      </p>
      {missions?.map((mission) => (
        <MissionHistoryItem key={mission.missionId} mission={mission} />
      ))}
    </ul>
  );
};

export default MissionHistory;
