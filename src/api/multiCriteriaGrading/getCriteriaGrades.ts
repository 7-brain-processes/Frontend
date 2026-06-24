import { apiRequestPreserveErrors } from '../client';
import { CriteriaGradeResultDto } from '../../types/Criterion';

export const getCriteriaGrades = (courseId: string, postId: string, solutionId: string): Promise<CriteriaGradeResultDto> => {
    return apiRequestPreserveErrors<CriteriaGradeResultDto>(`/courses/${courseId}/posts/${postId}/solutions/${solutionId}/criteria-grades`);
};
