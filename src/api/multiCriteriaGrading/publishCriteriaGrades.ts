import { apiRequest } from '../client';
import { CreatePostRequest, PostDto } from '../../types';

export const publishCriteriaGrades = (courseId: string, postId: string): Promise<void> => {
    return apiRequest<void>(`/courses/${courseId}/posts/${postId}/criteria-grades/publish`, {
        method: 'POST',
        body: JSON.stringify({}),
    });
};
