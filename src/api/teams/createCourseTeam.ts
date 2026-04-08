import { apiRequestPreserveErrors } from '../client';
import { CourseTeamDto, CreateCourseTeamRequest } from '../../types';

export const createCourseTeam = (
  courseId: string,
  data: CreateCourseTeamRequest
): Promise<CourseTeamDto> => {
  return apiRequestPreserveErrors<CourseTeamDto>(`/courses/${courseId}/teams`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};
