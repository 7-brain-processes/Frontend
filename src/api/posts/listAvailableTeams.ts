import { apiRequestPreserveErrors } from '../client';
import { CourseTeamAvailabilityDto } from '../../types';

export const listAvailableTeams = (
  courseId: string,
  postId: string
): Promise<CourseTeamAvailabilityDto[]> => {
  return apiRequestPreserveErrors<CourseTeamAvailabilityDto[]>(`/courses/${courseId}/posts/${postId}/teams`);
};
