import { apiRequest } from '../client';
import { ClosePeerReviewRoundResponseDto } from '../../types/Peer2peer';

export const closeRound2 = (courseId: string, postId: string): Promise<ClosePeerReviewRoundResponseDto> => {
    return apiRequest<ClosePeerReviewRoundResponseDto>(`/courses/${courseId}/posts/${postId}/peer-review/close-round2`, {
        method: 'POST',
        body: JSON.stringify({}),
    });
};
