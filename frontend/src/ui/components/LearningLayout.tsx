import { Outlet } from 'react-router-dom';
import { ModulesSidebar } from './ModulesSidebar';

export function LearningLayout() {
  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-4 overflow-x-hidden overflow-y-auto bg-mist-950 px-4 py-4 sm:px-5 sm:py-5 lg:flex-row lg:gap-6 lg:overflow-hidden lg:px-6 lg:py-6 dark:bg-mist-200">
      <ModulesSidebar />

      <main className="flex flex-1 flex-col min-h-0 overflow-visible">
        <Outlet />
      </main>
    </div>
  );
}
