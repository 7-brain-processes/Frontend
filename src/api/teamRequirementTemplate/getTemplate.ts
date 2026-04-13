import { apiRequestPreserveErrors } from '../client';
import { TeamRequirementTemplateDto } from '../../types/TeamRequirementTemplate';

export const getTemplate = (courseId: string, templateId: string): Promise<TeamRequirementTemplateDto> => {
    return apiRequestPreserveErrors<TeamRequirementTemplateDto>(`/courses/${courseId}/team-requirement-templates/${templateId}`);
};
