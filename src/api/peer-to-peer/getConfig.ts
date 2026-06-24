import { apiRequest } from '../client';
import { PeerReviewConfigDto } from '../../types/Peer2peer';

export const getConfig = (courseId: string, postId: string): Promise<PeerReviewConfigDto> => {
    return apiRequest<PeerReviewConfigDto>(`/courses/${courseId}/posts/${postId}/peer-review/config`);
};
