import { apiRequest } from '../client';

export const distributeRound1 = (courseId: string, postId: string): Promise<void> => {
    return apiRequest<void>(`/courses/${courseId}/posts/${postId}/peer-review/distribute`, {
        method: 'POST',
        body: JSON.stringify({}),
    });
};
