import { TeamGradeDistributionDto } from '../../types/TeamGrade';
import { apiRequest } from '../client';

export const getDistributionForm = (courseId: string, postId: string): Promise<TeamGradeDistributionDto> => {
    return apiRequest<TeamGradeDistributionDto>(`/courses/${courseId}/posts/${postId}/captain-grade`);
};
