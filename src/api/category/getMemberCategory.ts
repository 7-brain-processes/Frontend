import { apiRequest } from '../client';
import { CourseCategoryDto } from '../../types';

export const getMemberCategory = (courseId: string, memberId: string): Promise<CourseCategoryDto> => {
    return apiRequest<CourseCategoryDto>(`/courses/${courseId}/members/${memberId}/category`);
};
