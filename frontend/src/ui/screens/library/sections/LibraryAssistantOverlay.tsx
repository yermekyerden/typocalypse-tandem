import { AssistantPanel } from '@/features/assistant/ui/AssistantPanel';

type LibraryAssistantOverlayProps = {
  lessonId: string | null;
};

export function LibraryAssistantOverlay({ lessonId }: LibraryAssistantOverlayProps) {
  if (!lessonId) {
    return null;
  }

  return <AssistantPanel attemptId={`library-lesson-${lessonId}`} />;
}
