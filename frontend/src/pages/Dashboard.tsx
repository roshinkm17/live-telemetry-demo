import MissionHistory from "../components/mission-history";
import { Button } from "../components/ui/button";
import { useStartMission } from "../hooks/useMission";

function Dashboard() {
  const startMission = useStartMission();

  const handleStartMission = () => {
    console.log("Starting mission...");
    startMission.mutate();
  };

  return (
    <div className="container mx-auto p-8 grid place-items-center h-dvh w-dvw">
      <div className=" w-[50vw] h-[50vh] border border-gray-200 rounded-lg p-4 flex flex-col gap-4 justify-between overflow-y-auto">
        <Button className="w-fit" onClick={handleStartMission}>
          Start Mission
        </Button>
        <MissionHistory />
      </div>
    </div>
  );
}

export default Dashboard;
