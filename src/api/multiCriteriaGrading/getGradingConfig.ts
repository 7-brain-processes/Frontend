import { apiRequest } from '../client';
import { GradingConfigDto } from '../../types/Criterion';

export const getGradingConfig = (courseId: string, postId: string): Promise<GradingConfigDto> => {
    return apiRequest<GradingConfigDto>(`/courses/${courseId}/posts/${postId}/grading-config`);
};
