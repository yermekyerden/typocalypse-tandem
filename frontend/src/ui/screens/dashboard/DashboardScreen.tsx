import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/ui/components/ui/accordion';
import { modules } from '@/mocks/modules';
import { Progress } from '@/ui/components/ui/progress';
import { getStatus } from './utils';

export function DashboardScreen() {
  return (
    <Accordion type="multiple" className="max-w-lg" defaultValue={['notifications']}>
      {modules.map((item, index) => {
        return (
          <AccordionItem key={item.id} value={item.title}>
            <AccordionTrigger className="cursor-pointer hover:text-yellow-400">
              <div className="flex flex-col gap-2 w-full">
                <h2>{item.title}</h2>
                <Progress
                  className="mb-1.5 [&>div]:bg-yellow-400 h-3"
                  value={index === 0 ? 20 : 0}
                />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {item.lessons.map((lesson, index) => {
                return (
                  <div className="flex justify-between mb-2">
                    <span>{lesson.title}</span>
                    {getStatus(index)}
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
