import { apiRequest } from '../client';
import { CourseCategoryDto } from '../../types';

export const getMyCategory = (courseId: string): Promise<CourseCategoryDto> => {
    return apiRequest<CourseCategoryDto>(`/courses/${courseId}/members/me/category`);
};
