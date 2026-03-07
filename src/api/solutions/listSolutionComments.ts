import { apiRequest } from '../client';
import { PageCommentDto } from '../../types';

export const listSolutionComments = (
  courseId: string,
  postId: string,
  solutionId: string,
  params?: { page?: number; size?: number }
): Promise<PageCommentDto> => {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined) queryParams.append('page', params.page.toString());
  if (params?.size !== undefined) queryParams.append('size', params.size.toString());

  const query = queryParams.toString();
  return apiRequest<PageCommentDto>(
    `/courses/${courseId}/posts/${postId}/solutions/${solutionId}/comments${
      query ? `?${query}` : ''
    }`
  );
};
