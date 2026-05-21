import { apiRequest } from '../client';
import { GradingConfigDto, UpsertGradingConfigRequest } from '../../types/Criterion';

export const upsertGradingConfig = (
  courseId: string,
  postId: string,
  data: UpsertGradingConfigRequest
): Promise<GradingConfigDto> => {
  return apiRequest<GradingConfigDto>(`/courses/${courseId}/posts/${postId}/grading-config`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};
