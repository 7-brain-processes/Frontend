import { apiRequest } from '../client';
import { CriteriaGradeResultDto, CriteriaGradeSubmissionDto } from '../../types/Criterion';

export const upsertCriteriaGrades = (
    courseId: string,
    postId: string,
    solutionId: string,
    data: CriteriaGradeSubmissionDto
): Promise<CriteriaGradeResultDto> => {
    return apiRequest<CriteriaGradeResultDto>(`/courses/${courseId}/posts/${postId}/solutions/${solutionId}/criteria-grades`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};
