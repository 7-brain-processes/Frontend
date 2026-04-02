import { CourseCategoryDto, CreateCourseCategory } from "../../types";
import { apiRequest } from "../client";

export const createCategory = (data: CreateCourseCategory, courseId: string): Promise<CourseCategoryDto> => {
    return apiRequest<CourseCategoryDto>(`/courses/${courseId}/categories`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
};