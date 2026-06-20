import { PeerReviewConfigDto, PeerReviewConfigRequest } from "./Peer2peer";

export type CriterionType = 'YES_NO' | 'PERCENTAGE' | 'POINTS' | 'PEER_REVIEW';

export interface ContributionModifierDto {
    enabled: boolean;
    description: string;
}

export interface CriteriaGradeResultDto {
    solutionId: string;
    criteriaGrades: CriterionGradeResultItemDto[];
    modifierEffects: ModifierEffectDto[];
    basicScore: number;
    modifierDelta: number;
    finalScore: number;
    maxGrade: number;
    isPublished: boolean;
    gradedAt: Date;
}

export interface CriteriaGradeSubmissionDto {
    grades: CriterionGradeEntryDto[];
}

export interface CriterionConfigDto {
    id: string;
    type: CriterionType;
    title: string;
    maxPoints: number;
    weight: number;
    sortOrder: number;
    peerReviewConfig?: PeerReviewConfigDto;
    peerReviewConfigRequest?: PeerReviewConfigRequest;
}

export interface CriterionGradeEntryDto {
    criterionId: string;
    value: number;
    comment?: string;
}

export interface CriterionGradeResultItemDto {
    criterion: CriterionConfigDto;
    value: number;
    computedPoints: number;
    comment?: string;
}

export interface DeadlineModifierDto {
    enabled: boolean;
    softDeadline: Date;
    hardDeadline: Date;
    softDeadlineBonus: number;
    earlySubmissionBonusPerDay: number;
    latePenaltyPerDay: number;
    maxLatePenaltyDays: number;
}

export interface GradingConfigDto {
    postId: string;
    maxGrade: number;
    criteria: CriterionConfigDto[];
    modifiers: ModifierConfigDto;
    resultsVisible: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ModifierConfigDto {
    deadlines: DeadlineModifierDto;
    teamSize: TeamSizeModifierDto;
    progressRegularity: ProgressRegularityModifierDto;
    contributionVoting: ContributionModifierDto;
}

export interface ModifierEffectDto {
    modifierType: string;
    description: string;
    delta: number;
}

export interface ProgressRegularityModifierDto {
    enabled: boolean;
    checkpointCount: number;
    pointsPerCheckpoint: number;
}

export interface TeamSizeModifierDto {
    enabled: boolean;
    formula: string;
}

export interface UpsertGradingConfigRequest {//вот это 
    maxGrade: number;
    criteria: CriterionConfigDto[];
    modifiers: ModifierConfigDto;
    resultsVisible: boolean;
}