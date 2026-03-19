import { apiRequest } from '@/lib/api';

export type MissionHeader = {
  id: string;
  version: number;
  chapterId: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedMinutes: number;
  shortDescription: string;
  tags?: string[];
};

type MissionsListResponse = {
  missions: MissionHeader[];
};

export function listMissions() {
  return apiRequest<MissionsListResponse>('/missions');
}
