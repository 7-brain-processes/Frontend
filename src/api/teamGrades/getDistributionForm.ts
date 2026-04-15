import { TeamGradeDistributionDto } from '../../types/TeamGrade';
import { apiRequestPreserveErrors } from '../client';

export const getDistributionForm = (courseId: string, postId: string): Promise<TeamGradeDistributionDto> => {
    return apiRequestPreserveErrors<TeamGradeDistributionDto>(`/courses/${courseId}/posts/${postId}/captain-grade`);
};
