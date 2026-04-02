import { apiRequest } from '../client';
import { CourseCategoryDto } from '../../types';

export const listCategories = (courseId: string): Promise<CourseCategoryDto[]> => {
    return apiRequest<CourseCategoryDto[]>(`/courses/${courseId}/categories`);
};
