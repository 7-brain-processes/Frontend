import { apiRequestPreserveErrors } from '../client';
import { GradingConfigDto } from '../../types/Criterion';

export const getGradingConfig = (courseId: string, postId: string): Promise<GradingConfigDto> => {
    return apiRequestPreserveErrors<GradingConfigDto>(`/courses/${courseId}/posts/${postId}/grading-config`);
};
