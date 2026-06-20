import { apiRequest } from '../client';
import { PeerReviewAssignmentDto, SubmitPeerReviewRequest } from '../../types/Peer2peer';

export const submitPeerReview = (
    courseId: string,
    postId: string,
    assignmentId: string,
    data: SubmitPeerReviewRequest
): Promise<PeerReviewAssignmentDto> => {
    return apiRequest<PeerReviewAssignmentDto>(`/courses/${courseId}/posts/${postId}/peer-review/assignments/${assignmentId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};
