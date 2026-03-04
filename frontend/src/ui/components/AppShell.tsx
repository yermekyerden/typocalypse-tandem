import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export function AppShell() {
  return (
    <div className="min-h-dvh flex flex-col">
      <Header></Header>

      <main className="flex-1 w-full">
        <Outlet />
      </main>

      <Footer></Footer>
    </div>
  );
}
