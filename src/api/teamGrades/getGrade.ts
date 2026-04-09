import { TeamGradeDto } from '../../types/TeamGrade';
import { apiRequest } from '../client';

export const getGrade = (courseId: string, postId: string, teamId: string): Promise<TeamGradeDto> => {
    return apiRequest<TeamGradeDto>(`/courses/${courseId}/posts/${postId}/teams/${teamId}/grade`);
};
