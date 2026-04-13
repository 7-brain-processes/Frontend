import { apiRequestPreserveErrors } from '../client';
import { TeamRequirementTemplateDto } from '../../types/TeamRequirementTemplate';

export const listTemplates = (courseId: string): Promise<TeamRequirementTemplateDto[]> => {
  return apiRequestPreserveErrors<TeamRequirementTemplateDto[]>(`/courses/${courseId}/team-requirement-templates`);
};
