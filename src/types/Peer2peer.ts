export type PeerReviewAssignmentStatus = 'PENDING' | 'COMPLETED' | 'MISSED';
export type PeerReviewReviewMode = 'ONE_TO_ONE' | 'MANY_TO_ONE';
export type PeerReviewUsageType = 'CRITERION' | 'SEPARATE_GRADE';
export type PeerReviewScoringStrategy = 'AVERAGE' | 'MIN' | 'MAX';

export interface PeerReviewAssignmentDto {
    assignmentId: string;
    revieweeSolutionId: string;
    status: PeerReviewAssignmentStatus;
    round: number;
    firstDeadline: Date;
    assignedAt: Date;
    completedAt: Date;
    submittedGrade: number;
    submittedComment: string;
}

export interface SubmitPeerReviewRequest {
    grade: number;
    comment?: string;
}

export interface PeerReviewConfigDto {
    id: string;
    reviewersCount?: number;
    scoringStrategy: PeerReviewScoringStrategy;
    firstDeadline: Date;
    secondDeadline: Date;
    redistributionFactor: number;
    missedReviewPenalty: number;
    reviewMode: PeerReviewReviewMode;
    usageType: PeerReviewUsageType;
    round1ClosedAt: Date;
    round2ClosedAt: Date;
}

export interface PeerReviewConfigRequest {
    reviewersCount: number;
    scoringStrategy: PeerReviewScoringStrategy;
    firstDeadline: Date;
    secondDeadline: Date;
    redistributionFactor: number;
    missedReviewPenalty: number;
    reviewMode: PeerReviewReviewMode;
    usageType: PeerReviewUsageType;
}

export interface UnderReviewedSolutionDto {
    solutionId: string;
    studentId: string;
    studentUsername: string;
    teamId: string;
    teamName: string;
    requiredReviews: number;
    completedReviews: number;
}

export interface ClosePeerReviewRoundResponseDto {
    underReviewedSolutions: UnderReviewedSolutionDto[];
}
