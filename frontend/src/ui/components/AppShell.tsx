import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export function AppShell() {
  return (
    <div className="min-h-dvh flex flex-col bg-mist-950 text-yellow-50">
      <Header></Header>

      <main className="flex-1 w-full flex flex-col bg-mist-950">
        <Outlet />
      </main>

      <Footer></Footer>
    </div>
  );
}
