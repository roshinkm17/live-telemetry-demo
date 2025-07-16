import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";

export const BackButton = ({
  handleBackToDashboard,
}: {
  handleBackToDashboard: () => void;
}) => {
  return (
    <Button variant="outline" onClick={handleBackToDashboard}>
      <ArrowLeft />
      <span className="hidden md:inline">Back to Dashboard</span>
    </Button>
  );
};
