import { apiRequestPreserveErrors } from '../client';
import { SetTeamGradeDistributionModeRequest, TeamGradeDistributionDto } from '../../types/TeamGrade';

export const setDistributionMode = (
    courseId: string,
    postId: string,
    teamId: string,
    data: SetTeamGradeDistributionModeRequest
): Promise<TeamGradeDistributionDto> => {
    return apiRequestPreserveErrors<TeamGradeDistributionDto>(`/courses/${courseId}/posts/${postId}/teams/${teamId}/grade/distribution`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};
