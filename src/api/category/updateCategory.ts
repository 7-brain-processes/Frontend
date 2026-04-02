import { apiRequest } from '../client';
import { CourseCategoryDto, UpdateCourseCategoryRequest } from '../../types';

export const updateCategory = (courseId: string, categoryId: string, data: UpdateCourseCategoryRequest): Promise<CourseCategoryDto> => {
    return apiRequest<CourseCategoryDto>(`/courses/${courseId}/categories/${categoryId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};
