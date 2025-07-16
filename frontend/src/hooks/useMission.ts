import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  startMission,
  endMission,
  getAllMissions,
  getMission,
} from "@/api/mission";

export const useStartMission = () => {
  return useMutation({
    mutationFn: startMission,
    onSuccess: (data) => {
      console.log("Mission started successfully:", data);
    },
    onError: (error) => {
      console.error("Failed to start mission:", error);
    },
  });
};

export const useEndMission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: endMission,
    onSuccess: (data) => {
      console.log("Mission ended successfully:", data);
      // Invalidate missions list to refresh data
      queryClient.invalidateQueries({ queryKey: ["missions"] });
    },
    onError: (error) => {
      console.error("Failed to end mission:", error);
    },
  });
};

export const useGetAllMissions = () => {
  return useQuery({
    queryKey: ["missions"],
    queryFn: getAllMissions,
  });
};

export const useGetMission = (missionId: string) => {
  return useQuery({
    queryKey: ["mission", missionId],
    queryFn: () => getMission(missionId),
  });
};
