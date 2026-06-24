import { apiRequestPreserveErrors } from '../client';
import { CriteriaGradeResultDto } from '../../types/Criterion';

export const getGradeDecomposition = (courseId: string, postId: string, solutionId: string): Promise<CriteriaGradeResultDto> => {
    return apiRequestPreserveErrors<CriteriaGradeResultDto>(`/courses/${courseId}/posts/${postId}/solutions/${solutionId}/grade-decomposition`);
};
