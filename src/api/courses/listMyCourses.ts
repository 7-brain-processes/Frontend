import { apiRequest } from '../client';
import { PageCourseDto, CourseRole } from '../../types';

export const listMyCourses = (params?: {
  page?: number;
  size?: number;
  role?: CourseRole;
}): Promise<PageCourseDto> => {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined) queryParams.append('page', params.page.toString());
  if (params?.size !== undefined) queryParams.append('size', params.size.toString());
  if (params?.role) queryParams.append('role', params.role);

  const query = queryParams.toString();
  return apiRequest<PageCourseDto>(`/courses${query ? `?${query}` : ''}`);
};
