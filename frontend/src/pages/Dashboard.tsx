import MissionHistory from "../components/mission-history";
import TelemetryData from "../components/telemetry-data";
import { Button } from "../components/ui/button";
import { useStartMission } from "../hooks/useMission";

function Dashboard() {
  const startMission = useStartMission();

  const handleStartMission = () => {
    console.log("Starting mission...");
    startMission.mutate();
  };

  return (
    <div className="container mx-auto p-8 grid gap-8 grid-cols-4">
      <div className="flex flex-col gap-4 col-span-3">
        <div className="flex flex-col gap-4">
          <TelemetryData />
        </div>
        <Button className="w-fit" onClick={handleStartMission}>
          Start Mission
        </Button>
      </div>
      <div className="col-span-1">
        <MissionHistory />
      </div>
    </div>
  );
}

export default Dashboard;
