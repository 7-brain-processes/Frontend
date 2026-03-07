import { apiRequest } from '../client';
import { PageSolutionDto, SolutionStatus } from '../../types';

export const listSolutions = (
  courseId: string,
  postId: string,
  params?: { page?: number; size?: number; status?: SolutionStatus }
): Promise<PageSolutionDto> => {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined) queryParams.append('page', params.page.toString());
  if (params?.size !== undefined) queryParams.append('size', params.size.toString());
  if (params?.status) queryParams.append('status', params.status);

  const query = queryParams.toString();
  return apiRequest<PageSolutionDto>(
    `/courses/${courseId}/posts/${postId}/solutions${query ? `?${query}` : ''}`
  );
};
