import { BackButton } from "./back-button";

export const NotFound = ({
  handleBackToDashboard,
  missionId,
}: {
  handleBackToDashboard: () => void;
  missionId?: string;
}) => {
  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center gap-4 mb-8">
        <BackButton handleBackToDashboard={handleBackToDashboard} />
        <h1 className="text-3xl font-bold">Mission Not Found</h1>
      </div>
      <div className="text-center py-8">
        <p className="text-gray-600">
          Mission with ID "{missionId}" could not be found.
        </p>
      </div>
    </div>
  );
};
