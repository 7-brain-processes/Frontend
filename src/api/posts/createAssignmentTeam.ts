import { apiRequestPreserveErrors } from '../client';
import { CourseTeamDto } from '../../types';

export interface CreateAssignmentTeamRequest {
  name: string;
  maxSize: number;
  selfEnrollmentEnabled: boolean;
  memberIds?: string[];
  categoryIds?: string[];
}

export const createAssignmentTeam = (
  courseId: string,
  postId: string,
  data: CreateAssignmentTeamRequest
): Promise<CourseTeamDto> => {
  return apiRequestPreserveErrors<CourseTeamDto>(`/courses/${courseId}/posts/${postId}/teams`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};
