import { apiRequest } from '../client';

export const distributeRound2 = (courseId: string, postId: string): Promise<void> => {
    return apiRequest<void>(`/courses/${courseId}/posts/${postId}/peer-review/distribute-round2`, {
        method: 'POST',
        body: JSON.stringify({}),
    });
};
