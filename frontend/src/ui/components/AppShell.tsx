import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export function AppShell() {
  return (
    <div className="h-dvh flex flex-col bg-mist-950 text-yellow-50 overflow-hidden">
      <Header />

      <main className="flex-1 w-full flex flex-col bg-mist-950 min-h-0 overflow-hidden">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
