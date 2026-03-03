import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { ModulesSidebar } from './ModulesSidebar';

export function AppShell() {
  return (
    <div className="min-h-dvh flex flex-col">
      <Header></Header>

      <main className="flex-1 w-full">
        <div className="mx-auto flex h-full max-w-7xl gap-6 px-4 py-6">
          <ModulesSidebar />

          <section className="flex-1 flex flex-col">
            <Outlet />
          </section>
        </div>
      </main>

      <Footer></Footer>
    </div>
  );
}
