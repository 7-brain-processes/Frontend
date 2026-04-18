import { useEffect, useState } from "react";
import { CaptainGradeDistributionRequest, SetTeamGradeDistributionModeRequest, TeamGradeDistributionDto, TeamGradeDto } from "../../../../types/TeamGrade";
import { teamGradesService } from "../../../../api/teamGrades";
import { CourseTeamDto } from "../../../../types/Team";
import { CaptainDto } from "../../../../types";
import { teamFormationService } from "../../../../api/teamFormation";

const getHttpStatus = (err: any): number | null => {
    const message = String(err?.message || '');
    const match = message.match(/\b(400|403|404|409)\b/);
    return match ? Number(match[1]) : null;
};

export const loadTeamGradeFunc = async (courseId: string | undefined, postId: string | undefined, teamId: string | undefined, setGrade: React.Dispatch<React.SetStateAction<TeamGradeDto | null>>) => {
    if (!courseId || !postId || !teamId) return false;

    try {
        const grade = await teamGradesService.getGrade(courseId, postId, teamId);
        setGrade(grade);
    } catch (err: any) {
        const status = getHttpStatus(err);
        if (status === 403 || status === 404) {
            setGrade(null);
            return;
        }

        console.error('Failed to load team grade:', err);
        alert(err.message || 'Ошибка загрузки оценки команды');
    }
};

export const loadDistributionFunc = async (courseId: string | undefined, postId: string | undefined, teamId: string | undefined, setDistribution: React.Dispatch<React.SetStateAction<TeamGradeDistributionDto | null>>) => {
    if (!courseId || !postId || !teamId) return false;

    try {
        const distribution = await teamGradesService.getDistribution(courseId, postId, teamId);
        // Captain-only distribution form must not be loaded in teacher grading modal.
        setDistribution(distribution);
    } catch (err: any) {
        const status = getHttpStatus(err);
        if (status === 403 || status === 404) {
            setDistribution(null);
            return;
        }

        console.error('Failed to load grade distribution:', err);
        alert(err.message || 'Ошибка загрузки режима распределения оценки команды');
    }
};

export const loadCaptainDistributionFunc = async (courseId: string | undefined, postId: string | undefined, setDistribution: React.Dispatch<React.SetStateAction<TeamGradeDistributionDto | null>>) => {
    if (!courseId || !postId) return false;

    try {
        const distribution = await teamGradesService.getDistributionForm(courseId, postId);
        setDistribution(distribution);
    } catch (err: any) {
        console.error('Failed to load course:', err);
        alert(err.message || 'Ошибка загрузки распределения оценки капитаном');
    }
};

export const handleCaptainGradeDistributionFunc = async (courseId: string | undefined, postId: string | undefined, captainDistribution: CaptainGradeDistributionRequest, setDistribution: React.Dispatch<React.SetStateAction<TeamGradeDistributionDto | null>>) => {
    if (!courseId || !postId) return false;

    try {
        const distribution = await teamGradesService.saveDistribution(courseId, postId, captainDistribution);
        setDistribution(distribution);
        window.location.reload();

    } catch (err: any) {
        console.error('Failed to grade solution:', err);
        alert(err.message || 'Ошибка распределения оценки капитаном');
    }
};

export const handleDistributionModeFunc = async (courseId: string | undefined, postId: string | undefined, teamId: string | undefined, distributionMode: SetTeamGradeDistributionModeRequest) => {
    if (!courseId || !postId || !teamId) return false;

    try {
        await teamGradesService.setDistributionMode(courseId, postId, teamId, {
            distributionMode: distributionMode.distributionMode,
        });
    } catch (err: any) {
        console.error('Failed to grade solution:', err);
        alert(err.message || 'Ошибка выбора режима распределения оценки команды');
    }
};

export const handleTeamGradeSolutionFunc = async (
    courseId: string | undefined,
    postId: string | undefined,
    teamId: string | undefined,
    distributionMode: SetTeamGradeDistributionModeRequest,
    setShowTeamGradeModal: React.Dispatch<React.SetStateAction<boolean>>,
    gradeValue: number,
    setSelectedTeam: React.Dispatch<React.SetStateAction<CourseTeamDto | null>>,
    setGrade: React.Dispatch<React.SetStateAction<TeamGradeDto | null>>,
    setDistribution: React.Dispatch<React.SetStateAction<TeamGradeDistributionDto | null>>,
    gradeComment: string = ''
) => {
    if (!courseId || !postId || !teamId) return false;

    try {
        const savedGrade = await teamGradesService.upsertGrade(courseId, postId, teamId, {
            grade: gradeValue,
            comment: gradeComment.trim() || undefined,
        });

        if (savedGrade && typeof savedGrade.grade === 'number') {
            setGrade(savedGrade);
        }

        console.log('[TeamGrade] Team grade saved:', {
            courseId,
            postId,
            teamId,
            grade: savedGrade.grade,
            comment: savedGrade.comment,
            distributionMode: savedGrade.distributionMode,
            updatedAt: savedGrade.updatedAt,
        });

        const requestedMode = distributionMode.distributionMode;
        if (savedGrade.distributionMode !== requestedMode) {
            await teamGradesService.setDistributionMode(courseId, postId, teamId, {
                distributionMode: requestedMode,
            });
        }

        const updatedDistribution = await teamGradesService.getDistribution(courseId, postId, teamId);
        setDistribution(updatedDistribution);

        console.log('[TeamGrade] Team distribution loaded:', {
            courseId,
            postId,
            teamId,
            teamGrade: updatedDistribution.teamGrade,
            distributionMode: updatedDistribution.distributionMode,
            studentsCount: updatedDistribution.students.length,
        });

        setShowTeamGradeModal(false);
        setSelectedTeam(null);
        window.location.reload();
    } catch (err: any) {
        console.error('Failed to grade solution:', err);
        alert(err.message || 'Ошибка выставления оценки команде');
    }
};

export const useTeamGrade = (courseId?: string, postId?: string) => {
    const [grade, setGrade] = useState<TeamGradeDto | null>(null);
    const [distributionMode, setDistributionMode] = useState<SetTeamGradeDistributionModeRequest>({
        distributionMode: 'MANUAL'
    });
    const [distribution, setDistribution] = useState<TeamGradeDistributionDto | null>(null);
    const [showTeamGradeModal, setShowTeamGradeModal] = useState<boolean>(false);
    const [showCaptainGradeModal, setShowCaptainGradeModal] = useState<boolean>(false);
    const [gradeValue, setGradeValue] = useState<number>(0);
    const [gradeComment, setGradeComment] = useState<string>('');
    const [selectedTeam, setSelectedTeam] = useState<CourseTeamDto | null>(null);
    const [captainDistribution, setCaptainDistribution] = useState<CaptainGradeDistributionRequest>(
        {
            grades: []
        }
    );
    const [captains, setCaptains] = useState<CaptainDto[]>([]);

    const loadCaptains = async () => {
        if (!courseId || !postId) return false;

        try {

            const data = await teamFormationService.listCaptains(courseId, postId).catch((err: any) => {
                const status = getHttpStatus(err);
                if (status === 404) {
                    return [];
                }
                throw err;
            });
            setCaptains(data);
        } catch (err: any) {
            console.error('Failed to load captains:', err);
            setCaptains([]);
        }
    };

    const loadTeamGrade = () => {
        loadTeamGradeFunc(courseId, postId, selectedTeam?.id, setGrade);
    };

    const loadDistribution = () => {
        loadDistributionFunc(courseId, postId, selectedTeam?.id, setDistribution);
    }

    const handleTeamGradeSolution = () => {
        handleTeamGradeSolutionFunc(
            courseId,
            postId,
            selectedTeam?.id,
            distributionMode,
            setShowTeamGradeModal,
            gradeValue,
            setSelectedTeam,
            setGrade,
            setDistribution,
            gradeComment
        );
    };

    const handleCaptainGradeDistribution = () => {
        handleCaptainGradeDistributionFunc(courseId, postId, captainDistribution, setDistribution);
    };

    const handleOpenGradeModal = (team: CourseTeamDto) => {
        setSelectedTeam(team);
        setGradeValue(0);
        setGradeComment('');
        setShowTeamGradeModal(true);
    };

    const handleOpenCaptainGradeModal = () => {
        setShowCaptainGradeModal(true);
    };

    const handleGradeChange = (studentId: string, value: string) => {
        const grade = parseInt(value) || 0;

        const newGrades = [...captainDistribution.grades];
        const index = newGrades.findIndex(g => g.studentId === studentId);

        if (index > -1) {
            newGrades[index] = { ...newGrades[index], grade };
        } else {
            newGrades.push({ studentId, grade });
        }

        setCaptainDistribution({ grades: newGrades });
    };

    useEffect(() => {
        loadCaptains();
    }, [courseId, postId]);

    useEffect(() => {
        if (!selectedTeam?.id) return;
        loadTeamGrade();
        loadDistribution();
    }, [courseId, postId, selectedTeam?.id]);

    useEffect(() => {
        if (!showTeamGradeModal) return;
        setGradeValue(grade?.grade || 0);
        setGradeComment(grade?.comment || '');
    }, [grade, showTeamGradeModal]);

    return {
        state: { grade, distribution, showTeamGradeModal, selectedTeam, gradeValue, gradeComment, distributionMode, captains, showCaptainGradeModal, captainDistribution },
        functions: {
            handleOpenGradeModal,
            setShowTeamGradeModal,
            setGradeValue,
            setGradeComment,
            handleTeamGradeSolution,
            setDistributionMode,
            handleCaptainGradeDistribution,
            handleOpenCaptainGradeModal,
            setShowCaptainGradeModal,
            setCaptainDistribution,
            handleGradeChange
        }
    }
}

