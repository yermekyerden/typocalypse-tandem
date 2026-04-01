import { Outlet } from 'react-router-dom';
import { ModulesSidebar } from './ModulesSidebar';

export function LearningLayout() {
  return (
    <div className="flex h-full w-full gap-6 px-6 py-6 min-h-0 bg-mist-950 overflow-hidden">
      <ModulesSidebar />

      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
