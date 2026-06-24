import { apiRequest } from '../client';
import { UnderReviewedSolutionDto } from '../../types/Peer2peer';

export const getUnderReviewed = (courseId: string, postId: string): Promise<UnderReviewedSolutionDto[]> => {
    return apiRequest<UnderReviewedSolutionDto[]>(`/courses/${courseId}/posts/${postId}/peer-review/under-reviewed`);
};
