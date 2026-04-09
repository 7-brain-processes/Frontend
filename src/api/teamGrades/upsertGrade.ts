import { apiRequest } from '../client';
import { TeamGradeDto, UpsertTeamGradeRequest } from '../../types/TeamGrade';

export const upsertGrade = (
    courseId: string,
    postId: string,
    teamId: string,
    data: UpsertTeamGradeRequest
): Promise<TeamGradeDto> => {
    return apiRequest<TeamGradeDto>(`/courses/${courseId}/posts/${postId}/teams/${teamId}/grade`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};
