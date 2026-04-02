import { apiRequest } from '../client';
import { CourseCategoryDto, SetMyCategoryRequest } from '../../types';

export const setMyCategory = (courseId: string, data: SetMyCategoryRequest): Promise<CourseCategoryDto> => {
    return apiRequest<CourseCategoryDto>(`/courses/${courseId}/members/me/category`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};
