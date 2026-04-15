import { apiRequestPreserveErrors } from '../client';
import { CaptainGradeDistributionRequest, TeamGradeDistributionDto } from '../../types/TeamGrade';

export const saveDistribution = (
    courseId: string,
    postId: string,
    data: CaptainGradeDistributionRequest
): Promise<TeamGradeDistributionDto> => {
    return apiRequestPreserveErrors<TeamGradeDistributionDto>(`/courses/${courseId}/posts/${postId}/captain-grade`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};
