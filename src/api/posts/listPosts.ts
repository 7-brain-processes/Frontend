import { apiRequest } from '../client';
import { PagePostDto, PostType } from '../../types';

export const listPosts = (
  courseId: string,
  params?: { page?: number; size?: number; type?: PostType }
): Promise<PagePostDto> => {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined) queryParams.append('page', params.page.toString());
  if (params?.size !== undefined) queryParams.append('size', params.size.toString());
  if (params?.type) queryParams.append('type', params.type);

  const query = queryParams.toString();
  return apiRequest<PagePostDto>(
    `/courses/${courseId}/posts${query ? `?${query}` : ''}`
  );
};
