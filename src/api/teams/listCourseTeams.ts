import { apiRequestPreserveErrors } from '../client';
import { CourseTeamDto } from '../../types';

export const listCourseTeams = (courseId: string): Promise<CourseTeamDto[]> => {
  return apiRequestPreserveErrors<CourseTeamDto[]>(`/courses/${courseId}/teams`);
};
