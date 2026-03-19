export type LessonStatus = 'locked' | 'active' | 'completed';

export type LearningLessonSummary = {
  id: string;
  slug: string;
  title: string;
  order: number;
  status: LessonStatus;
};

export type LearningModule = {
  id: string;
  slug: string;
  title: string;
  description: string;
  order: number;
  lessons: LearningLessonSummary[];
};

export type LearningLessonDetail = {
  id: string;
  moduleId: string;
  slug: string;
  title: string;
  order: number;
  theoryMarkdown: string;
  taskDescription: string;
  hints?: string[];
  runtime?: {
    expectedCommand: string;
    expectedCwd?: string;
    sampleOutput?: string;
  };
};

export type LearningLessonView = LearningLessonSummary & {
  theoryMarkdown: string;
  taskDescription: string;
  hints: string[];
};
