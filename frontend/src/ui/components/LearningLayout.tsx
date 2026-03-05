import { Outlet } from 'react-router-dom';
import { ModulesSidebar } from './ModulesSidebar';

export function LearningLayout() {
  return (
    <div className="mx-auto flex h-full max-w-7xl gap-6 px-4 py-6">
      <ModulesSidebar />

      <section className="flex-1 flex flex-col">
        <Outlet />
      </section>
    </div>
  );
}
