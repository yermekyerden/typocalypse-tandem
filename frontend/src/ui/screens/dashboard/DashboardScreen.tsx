import { useEffect } from 'react';

import { useI18n } from '@/i18n/useI18n';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/ui/components/ui/accordion';
import { useMemo } from 'react';
import { useTerminalSession } from '@/store/terminalSession';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Label } from 'recharts';
import { Progress } from '@/ui/components/ui/progress';
import { getStatus } from './utils';

export function DashboardScreen() {
  const { t } = useI18n();
  const modules = useTerminalSession((state) => state.modules);
  const initialize = useTerminalSession((state) => state.initialize);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  const overallStats = useMemo(() => {
    const allLessons = modules.flatMap((module) => module.lessons);
    const completed = allLessons.filter((l) => l.status === 'completed').length;
    const active = allLessons.filter((l) => l.status === 'active').length;
    const locked = allLessons.filter((l) => l.status === 'locked').length;
    const total = allLessons.length;
    const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

    const chartData = [
      { name: t('library.status.completed'), value: completed, fill: '#10b981' },
      { name: t('library.status.active'), value: active, fill: '#fbbf24' },
      { name: t('library.status.locked'), value: locked, fill: '#9ca3af' },
    ].filter((item) => item.value > 0);

    return { total, completed, active, locked, progressPercent, chartData };
  }, [modules, t]);

  const activeModuleTitle = useMemo(() => {
    const moduleWithActive = modules.find((module) =>
      module.lessons.some((lesson) => lesson.status === 'active'),
    );
    return moduleWithActive?.title;
  }, [modules]);

  const chartConfig = {
    completed: { label: t('library.status.completed'), color: '#10b981' },
    active: { label: t('library.status.active'), color: '#fbbf24' },
    locked: { label: t('library.status.locked'), color: '#9ca3af' },
  };

  return (
    <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 p-6">
      <div className="flex-1 w-[80%]">
        <Accordion
          type="multiple"
          className="lg:max-w-lg md:w-full"
          defaultValue={activeModuleTitle ? [activeModuleTitle] : undefined}
        >
          {modules.map((item) => {
            const completedLessons = item.lessons.filter(
              (lesson) => lesson.status === 'completed',
            ).length;
            const progressValue =
              item.lessons.length > 0
                ? (completedLessons / item.lessons.length) * 100
                : 0;

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
                        {getStatus(lesson.status, t)}
                      </div>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
      <div className="w-80 flex-shrink-0">
        <div className="sticky top-6 bg-[#2c2c2c] rounded-lg border border-yellow-400 p-6">
          <h3 className="text-lg font-semibold mb-4 text-center">
            {t('profile.progress')}
          </h3>

          {overallStats.total > 0 ? (
            <>
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square w-full max-w-[240px]"
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={overallStats.chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={80}
                    strokeWidth={2}
                    stroke="hsl(var(--background))"
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-white text-2xl font-bold"
                              >
                                {overallStats.progressPercent}%
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground text-xs"
                              >
                                {t('library.status.completed')}
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    {t('library.status.completed')}:
                  </span>
                  <span className="font-medium">{overallStats.completed}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    {t('library.status.active')}:
                  </span>
                  <span className="font-medium">{overallStats.active}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-400" />
                    {t('library.status.locked')}:
                  </span>
                  <span className="font-medium">{overallStats.locked}</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between text-sm font-semibold">
                  <span>{t('library.totalLessons')}::</span>
                  <span>{overallStats.total}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              {t('library.noLessonDetails')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
