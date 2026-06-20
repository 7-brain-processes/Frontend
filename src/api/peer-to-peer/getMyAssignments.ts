import { apiRequest } from '../client';
import { PeerReviewAssignmentDto } from '../../types/Peer2peer';

export const getMyAssignments = (courseId: string, postId: string): Promise<PeerReviewAssignmentDto[]> => {
    return apiRequest<PeerReviewAssignmentDto[]>(`/courses/${courseId}/posts/${postId}/peer-review/my-assignments`);
};
