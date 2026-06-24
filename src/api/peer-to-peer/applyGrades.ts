import { apiRequest } from '../client';

export const applyGrades = (courseId: string, postId: string): Promise<void> => {
    return apiRequest<void>(`/courses/${courseId}/posts/${postId}/peer-review/apply-grades`, {
        method: 'POST',
        body: JSON.stringify({}),
    });
};
