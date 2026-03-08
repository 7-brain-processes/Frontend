import { apiRequest } from '../client';
import { PageMemberDto, CourseRole } from '../../types';

export const listMembers = (
  courseId: string,
  params?: { page?: number; size?: number; role?: CourseRole }
): Promise<PageMemberDto> => {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined) queryParams.append('page', params.page.toString());
  if (params?.size !== undefined) queryParams.append('size', params.size.toString());
  if (params?.role) queryParams.append('role', params.role);

  const query = queryParams.toString();
  return apiRequest<PageMemberDto>(
    `/courses/${courseId}/members${query ? `?${query}` : ''}`
  );
};
