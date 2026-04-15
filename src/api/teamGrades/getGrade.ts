import { TeamGradeDto } from '../../types/TeamGrade';
import { apiRequestPreserveErrors } from '../client';

export const getGrade = (courseId: string, postId: string, teamId: string): Promise<TeamGradeDto> => {
    return apiRequestPreserveErrors<TeamGradeDto>(`/courses/${courseId}/posts/${postId}/teams/${teamId}/grade`);
};
