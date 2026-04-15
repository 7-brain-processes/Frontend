import { TeamGradeDistributionDto } from '../../types/TeamGrade';
import { apiRequestPreserveErrors } from '../client';

export const getDistribution = (courseId: string, postId: string, teamId: string): Promise<TeamGradeDistributionDto> => {
    return apiRequestPreserveErrors<TeamGradeDistributionDto>(`/courses/${courseId}/posts/${postId}/teams/${teamId}/grade/distribution`);
};
