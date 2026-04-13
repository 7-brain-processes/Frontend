import { CourseCategoryDto } from "./Category";

export type TeamFormationMode = 'FREE' | 'DRAFT' | 'RANDOM_SHUFFLE' | 'CAPTAIN_SELECTION';

export interface TeamRequirementTemplateDto {
    id: string;
    name: string;
    description: string;
    minTeamSize: number;
    maxTeamSize: number;
    requiredCategory: CourseCategoryDto;
    requireAudio: boolean;
    requireVideo: boolean;
    active: boolean;
    createdAt: Date;
    archivedAt: Date;
}

export interface CreateTeamRequirementTemplateRequest {
    name: string;//max 200
    description?: string; //max  2000
    minTeamSize: number;
    maxTeamSize: number;
    requiredCategoryId: string;
    requireAudio?: boolean;
    requireVideo?: boolean;
}

export interface ApplyTeamRequirementTemplateRequest {
    postId: string;
}

export interface TemplateApplyResultDto {
    postId: string;
    templateId: string;
    appliedMode: TeamFormationMode;
}

export interface UpdateTeamRequirementTemplateRequest {

}