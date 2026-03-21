import { Outlet } from 'react-router-dom';
import { ModulesSidebar } from './ModulesSidebar';

export function LearningLayout() {
  return (
    <main
      aria-label="Learning workspace"
      className="flex h-full w-full min-h-0 gap-6 overflow-hidden bg-mist-950 px-6 py-6"
    >
      <ModulesSidebar />

      <section
        aria-label="Learning content"
        className="flex flex-1 flex-col min-h-0 overflow-hidden"
      >
        <Outlet />
      </section>
    </main>
  );
}
