import { Link, Outlet } from 'react-router-dom';

export function AppShell() {
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
          <Link to="/" className="font-semibold">
            Typocalypse
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
