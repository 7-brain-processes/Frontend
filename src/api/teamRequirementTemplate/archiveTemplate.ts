import { apiRequestPreserveErrors } from '../client';

export const archiveTemplate = (
    courseId: string,
    templateId: string
): Promise<void> => {
    return apiRequestPreserveErrors<void>(`/courses/${courseId}/team-requirement-templates/${templateId}`, {
        method: 'DELETE',
    });
};
