import { UserDto } from './User';

export type SolutionStatus = 'SUBMITTED' | 'GRADED';

export interface SolutionDto {
  id: string;
  text: string;
  status: SolutionStatus;
  grade: number | null;
  filesCount: number;
  student: UserDto;
  submittedAt: string;
  updatedAt: string;
  gradedAt: string | null;
}

export interface CreateSolutionRequest {
  text?: string;
}

export interface PageSolutionDto {
  content: SolutionDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface GradeRequest {
  grade: number | null;
  comment?: string;
}
