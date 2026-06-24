import { apiRequest } from '../client';

export const closeRound1 = (courseId: string, postId: string): Promise<void> => {
    return apiRequest<void>(`/courses/${courseId}/posts/${postId}/peer-review/close-round1`, {
        method: 'POST',
        body: JSON.stringify({}),
    });
};
