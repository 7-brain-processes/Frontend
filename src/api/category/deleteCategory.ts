import { apiRequest } from '../client';

export const deleteCategory = (courseId: string, categoryId: string): Promise<void> => {
    return apiRequest<void>(`/courses/${courseId}/categories/${categoryId}`, {
        method: 'DELETE',
    });
};
