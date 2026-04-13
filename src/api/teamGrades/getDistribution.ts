import { TeamGradeDistributionDto } from '../../types/TeamGrade';
import { apiRequest } from '../client';

export const getDistribution = (courseId: string, postId: string, teamId: string): Promise<TeamGradeDistributionDto> => {
    return apiRequest<TeamGradeDistributionDto>(`/courses/${courseId}/posts/${postId}/teams/${teamId}/grade/distribution`);
};
