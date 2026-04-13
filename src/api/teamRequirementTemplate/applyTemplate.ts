import { apiRequestPreserveErrors } from '../client';
import { ApplyTeamRequirementTemplateRequest, CreateTeamRequirementTemplateRequest, TeamRequirementTemplateDto, TemplateApplyResultDto } from '../../types/TeamRequirementTemplate';

export const applayTemplate = (
    courseId: string,
    templateId: string,
    data: ApplyTeamRequirementTemplateRequest
): Promise<TemplateApplyResultDto> => {
    return apiRequestPreserveErrors<TemplateApplyResultDto>(`/courses/${courseId}/team-requirement-templates/${templateId}/apply`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
};
