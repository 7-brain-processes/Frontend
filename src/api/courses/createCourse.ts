import { apiRequest } from '../client';
import { CreateCourseRequest, CourseDto } from '../../types';

export const createCourse = (data: CreateCourseRequest): Promise<CourseDto> => {
  return apiRequest<CourseDto>('/courses', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};