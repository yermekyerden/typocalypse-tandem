import { Link } from 'react-router-dom';

export function LibraryScreen() {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">Mission Library</h1>
      <p className="text-sm text-muted-foreground">
        Scaffold is ready. Next: real mission data + engine wiring.
      </p>

      <div className="text-sm">
        <Link to="/missions/demo">Open demo mission</Link>
      </div>
    </div>
  );
}
