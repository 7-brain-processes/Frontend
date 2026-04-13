import { apiRequestPreserveErrors } from '../client';
import { CreateTeamRequirementTemplateRequest, TeamRequirementTemplateDto } from '../../types/TeamRequirementTemplate';

export const createTemplate = (
    courseId: string,
    data: CreateTeamRequirementTemplateRequest
): Promise<TeamRequirementTemplateDto> => {
    return apiRequestPreserveErrors<TeamRequirementTemplateDto>(`/courses/${courseId}/team-requirement-templates`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
};
