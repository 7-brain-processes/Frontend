import { UserDto } from "./User";

export type TeamGradeDistributionMode = 'MANUAL' | 'AUTO_EQUAL' | 'CAPTAIN_MANUAL' | 'TEAM_VOTE';

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

export interface MyTeamGradeStudentDistributedGradeDto {
    student: UserDto;
    grade: number | null;
}

export interface MyTeamGradeDto {
    teamId: string;
    teamName: string;
    teamGrade: number | null;
    distributionMode: TeamGradeDistributionMode;
    myGrade: number | null;
    finalized: boolean;
    finalDistribution: MyTeamGradeStudentDistributedGradeDto[] | null;
}

export interface CaptainStudentGradeEntry {
    studentId: string;
    grade: number;
}

export interface CaptainGradeDistributionRequest {
    grades: CaptainStudentGradeEntry[];
}

export interface GradeVoteVoterDto {
    user: UserDto;
    hasVoted: boolean;
}

export interface GradeVoteStatusDto {
    teamId: string;
    teamGrade: number;
    finalized: boolean;
    voters: GradeVoteVoterDto[];
    myVote: StudentDistributedGradeDto[] | null;
    finalDistribution: StudentDistributedGradeDto[] | null;
}

export interface SubmitGradeVoteRequest {
    grades: CaptainStudentGradeEntry[];
}
