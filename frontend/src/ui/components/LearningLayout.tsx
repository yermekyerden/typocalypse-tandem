import { Outlet } from 'react-router-dom';
import { ModulesSidebar } from './ModulesSidebar';

export function LearningLayout() {
  return (
    <div className="flex h-full w-full gap-6 px-6 py-6">
      <ModulesSidebar />

      <section className="flex-1 flex flex-col">
        <Outlet />
      </section>
    </div>
  );
}
