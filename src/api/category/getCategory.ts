import { apiRequest } from '../client';
import { CourseCategoryDto } from '../../types';

export const getCategory = (courseId: string, categoryId: string): Promise<CourseCategoryDto> => {
    return apiRequest<CourseCategoryDto>(`/courses/${courseId}//categories/${categoryId}`);
};