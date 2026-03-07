import { apiRequest } from '../client';
import { UpdateCourseRequest, CourseDto } from '../../types';

export const updateCourse = (courseId: string, data: UpdateCourseRequest): Promise<CourseDto> => {
  return apiRequest<CourseDto>(`/courses/${courseId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};
