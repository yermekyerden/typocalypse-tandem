import { AssistantPanel } from '@/features/assistant/ui/AssistantPanel';

type LibraryAssistantOverlayProps = {
  lessonId: string | null;
  attemptId: string | null;
};

export function LibraryAssistantOverlay({
  lessonId,
  attemptId,
}: LibraryAssistantOverlayProps) {
  if (!lessonId) {
    return null;
  }

  return <AssistantPanel attemptId={attemptId} />;
}
