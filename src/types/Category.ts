export interface CourseCategoryDto {
    id: string;
    title: string;
    description: string;
    active: boolean;
    createdAt: Date;
}

export interface CreateCourseCategory {
    title: string;
    description: string;
    active: boolean;
}

export interface SetMyCategoryRequest {
    categotyId: string | null;
}

export interface UpdateCourseCategoryRequest {
    title: string;
    description: string;
    active: boolean;
}