import { useEffect } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/ui/components/ui/accordion';
import { useTerminalSession } from '@/store/terminalSession';
import { Progress } from '@/ui/components/ui/progress';
import { getStatus } from './utils';

export function DashboardScreen() {
  const modules = useTerminalSession((state) => state.modules);
  const initialize = useTerminalSession((state) => state.initialize);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <Accordion type="multiple" className="max-w-lg" defaultValue={['notifications']}>
      {modules.map((item) => {
        const completedLessons = item.lessons.filter(
          (lesson) => lesson.status === 'completed',
        ).length;
        const progressValue =
          item.lessons.length > 0 ? (completedLessons / item.lessons.length) * 100 : 0;

        return (
          <AccordionItem key={item.id} value={item.title}>
            <AccordionTrigger className="cursor-pointer hover:text-yellow-400">
              <div className="flex flex-col gap-2 w-full">
                <h2>{item.title}</h2>
                <Progress
                  className="mb-1.5 [&>div]:bg-yellow-400 h-3"
                  value={progressValue}
                />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {item.lessons.map((lesson) => {
                return (
                  <div key={lesson.id} className="flex justify-between mb-2">
                    <span>{lesson.title}</span>
                    {getStatus(lesson.status)}
                  </div>
                );
              })}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
