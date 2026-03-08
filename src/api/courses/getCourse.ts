import { apiRequest } from '../client';
import { CourseDto } from '../../types';

export const getCourse = (courseId: string): Promise<CourseDto> => {
  return apiRequest<CourseDto>(`/courses/${courseId}`);
};
