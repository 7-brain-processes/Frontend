import { apiRequest } from '../client';
import { SetMyCategoryRequest } from '../../types';

export const setMyCategory = (courseId: string, data: SetMyCategoryRequest): Promise<void> => {
    return apiRequest<void>(`/courses/${courseId}/members/me/category`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};
