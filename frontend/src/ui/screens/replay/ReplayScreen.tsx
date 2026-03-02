import { useParams } from 'react-router-dom';

export function ReplayScreen() {
  const { attemptId } = useParams();

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">Replay</h1>
      <p className="text-sm text-muted-foreground">attemptId: {attemptId}</p>
    </div>
  );
}
