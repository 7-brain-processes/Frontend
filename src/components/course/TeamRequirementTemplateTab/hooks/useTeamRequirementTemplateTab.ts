import { useEffect, useState } from "react";
import { teamRequirementTemplateService } from "../../../../api/teamRequirementTemplate";
import { CourseRole } from "../../../../types";
import { TeamRequirementTemplateDto } from "../../../../types/TeamRequirementTemplate";

export const loadTeamRequirementTemplatesFunc = async (courseId: string | undefined, setTemplates: React.Dispatch<React.SetStateAction<TeamRequirementTemplateDto[]>>) => {
    if (!courseId) return false;

    try {
        const templates = await teamRequirementTemplateService.listTemplates(courseId);
        setTemplates(templates);
    } catch (err: any) {
        console.error('Failed to load course:', err);
        setTemplates([]);
        alert(err.message || 'Ошибка загрузки шаблонов требований');
    }
};

export const deleteTeamRequirementTemplateFunc = async (courseId: string | undefined, templateId: string | undefined) => {
    if (!courseId || !templateId) return false;

    try {
        await teamRequirementTemplateService.archiveTemplate(courseId, templateId);
    } catch (err: any) {
        console.error('Failed to load course:', err);
        alert(err.message || 'Ошибка архивирования шаблона');
    }
};

export const useTeamRequirementTemplateTab = (courseId: string, userRole: CourseRole) => {

    const [templates, setTemplates] = useState<TeamRequirementTemplateDto[]>([]);
    const [showTemplate, setShowTemplate] = useState<boolean>(false);

    const loadTeamRequirementTemplates = () => {
        loadTeamRequirementTemplatesFunc(courseId, setTemplates);
    };

    const deleteTeamRequirementTemplate = (templateId: string) => {
        deleteTeamRequirementTemplateFunc(courseId, templateId)
    };

    useEffect(() => {
        loadTeamRequirementTemplates();
    }, []);

    return {
        state: { templates, showTemplate },
        functions: {
            setShowTemplate,
            deleteTeamRequirementTemplate
        }
    }
}