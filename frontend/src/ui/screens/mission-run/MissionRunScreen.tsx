import { useParams } from 'react-router-dom';

export function MissionRunScreen() {
  const { missionId } = useParams();

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">Mission Run</h1>
      <p className="text-sm text-muted-foreground">missionId: {missionId}</p>
    </div>
  );
}
