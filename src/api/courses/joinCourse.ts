import { apiRequest } from '../client';
import { CourseDto } from '../../types';

export const joinCourse = (code: string): Promise<CourseDto> => {
  return apiRequest<CourseDto>(`/invites/${code}/join`, {
    method: 'POST',
  });
};