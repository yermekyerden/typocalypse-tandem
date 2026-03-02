import { create } from 'zustand';

type State = {
  selectedLessonId: string | null;
  selectLesson: (id: string) => void;
};

export const useLessonSelection = create<State>((set) => ({
  selectedLessonId: null,
  selectLesson: (id: string) => set({ selectedLessonId: id }),
}));
