import { apiRequest } from '../client';
import { TeamRequirementTemplateDto, UpdateTeamRequirementTemplateRequest } from '../../types/TeamRequirementTemplate';

export const updateTemplate = (
    courseId: string,
    templateId: string,
    data: UpdateTeamRequirementTemplateRequest
): Promise<TeamRequirementTemplateDto> => {
    return apiRequest<TeamRequirementTemplateDto>(
        `/courses/${courseId}/team-requirement-templates/${templateId}`,
        {
            method: 'PUT',
            body: JSON.stringify(data),
        }
    );
};
