import { UserDto } from "./User";

export type TeamGradeDistributionMode = 'MANUAL' | 'AUTO_EQUAL';

export interface TeamGradeDto {
    id: string;
    postId: string;
    teamId: string;
    grade: number;
    comment: string;
    distributionMode: TeamGradeDistributionMode;
    updatedAt: Date;
}

export interface UpsertTeamGradeRequest {
    grade: number;
    comment?: string;
}

export interface SetTeamGradeDistributionModeRequest {
    distributionMode: TeamGradeDistributionMode;
}

export interface StudentDistributedGradeDto {
    student: UserDto;
    grade: number;
}

export interface TeamGradeDistributionDto {
    teamId: string;
    teamGrade: number;
    distributionMode: TeamGradeDistributionMode;
    students: StudentDistributedGradeDto[];
}