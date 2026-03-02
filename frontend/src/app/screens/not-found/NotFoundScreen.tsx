import { Link } from 'react-router-dom';

export function NotFoundScreen() {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">404</h1>
      <Link to="/" className="text-sm underline">
        Go home
      </Link>
    </div>
  );
}
