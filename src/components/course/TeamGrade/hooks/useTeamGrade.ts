import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CaptainGradeDistributionRequest, SetTeamGradeDistributionModeRequest, TeamGradeDistributionDto, TeamGradeDto } from "../../../../types/TeamGrade";
import { teamGradesService } from "../../../../api/teamGrades";
import { CourseTeamDto } from "../../../../types/Team";
import { CaptainDto } from "../../../../types";
import { teamFormationService } from "../../../../api/teamFormation";

export const loadTeamGradeFunc = async (courseId: string | undefined, postId: string | undefined, teamId: string | undefined, setGrade: React.Dispatch<React.SetStateAction<TeamGradeDto | null>>) => {
    if (!courseId || !postId || !teamId) return false;

    try {
        const grade = await teamGradesService.getGrade(courseId, postId, teamId);
        setGrade(grade);
    } catch (err: any) {
        console.error('Failed to load course:', err);
        alert(err.message || 'Ошибка загрузки оценки команды');
    }
};

export const loadDistributionFunc = async (courseId: string | undefined, postId: string | undefined, teamId: string | undefined, setDistribution: React.Dispatch<React.SetStateAction<TeamGradeDistributionDto | null>>) => {
    if (!courseId || !postId || !teamId) return false;

    try {
        const distribution = await teamGradesService.getDistribution(courseId, postId, teamId);
        if (distribution.distributionMode === 'MANUAL') {
            const captainDistribution = await teamGradesService.getDistributionForm(courseId, postId);
            setDistribution(captainDistribution);
            return;
        }
        setDistribution(distribution);
    } catch (err: any) {
        console.error('Failed to load course:', err);
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
    if (!courseId || !postId) return;

    try {
        const distribution = await teamGradesService.saveDistribution(courseId, postId, captainDistribution);
        setDistribution(distribution);

    } catch (err: any) {
        console.error('Failed to grade solution:', err);
        alert(err.message || 'Ошибка распределения оценки капитаном');
    }
};

export const handleDistributionModeFunc = async (courseId: string | undefined, postId: string | undefined, teamId: string | undefined, distributionMode: SetTeamGradeDistributionModeRequest) => {
    if (!courseId || !postId || !teamId) return;

    try {
        await teamGradesService.setDistributionMode(courseId, postId, teamId, {
            distributionMode: distributionMode.distributionMode,
        });
    } catch (err: any) {
        console.error('Failed to grade solution:', err);
        alert(err.message || 'Ошибка выбора режима распределения оценки команды');
    }
};

export const handleTeamGradeSolutionFunc = async (courseId: string | undefined, postId: string | undefined, teamId: string | undefined, distributionMode: SetTeamGradeDistributionModeRequest, setShowTeamGradeModal: React.Dispatch<React.SetStateAction<boolean>>, gradeValue: number, setSelectedTeam: React.Dispatch<React.SetStateAction<CourseTeamDto | null>>) => {
    if (!courseId || !postId || !teamId) return;

    try {
        handleDistributionModeFunc(courseId, postId, teamId, distributionMode);

        await teamGradesService.upsertGrade(courseId, postId, teamId, {
            grade: gradeValue,
        });
        setShowTeamGradeModal(false);
        setSelectedTeam(null);
        window.location.reload();
    } catch (err: any) {
        console.error('Failed to grade solution:', err);
        alert(err.message || 'Ошибка выставления оценки команде');
    }
};

const getHttpStatus = (err: any): number | null => {
    const message = String(err?.message || '');
    const match = message.match(/\b(400|403|404|409)\b/);
    return match ? Number(match[1]) : null;
};

export const useTeamGrade = () => {
    const { courseId, taskId } = useParams<{ courseId: string; taskId: string }>();
    const [grade, setGrade] = useState<TeamGradeDto | null>(null);
    const [distributionMode, setDistributionMode] = useState<SetTeamGradeDistributionModeRequest>({
        distributionMode: 'MANUAL'
    });
    const [distribution, setDistribution] = useState<TeamGradeDistributionDto | null>(null);
    const [showTeamGradeModal, setShowTeamGradeModal] = useState<boolean>(false);
    const [showCaptainGradeModal, setShowCaptainGradeModal] = useState<boolean>(false);
    const [gradeValue, setGradeValue] = useState<number>(0);
    const [selectedTeam, setSelectedTeam] = useState<CourseTeamDto | null>(null);
    const [captainDistribution, setCaptainDistribution] = useState<CaptainGradeDistributionRequest>(
        {
            grades: []
        }
    );
    const [captains, setCaptains] = useState<CaptainDto[]>([]);

    const loadCaptains = async () => {
        if (!courseId || !taskId) return;

        try {

            const data = await teamFormationService.listCaptains(courseId, taskId).catch((err: any) => {
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
        loadTeamGradeFunc(courseId, taskId, selectedTeam?.id, setGrade);
    };

    const loadDistribution = () => {
        loadDistributionFunc(courseId, taskId, selectedTeam?.id, setDistribution);
    }

    const handleTeamGradeSolution = () => {
        handleTeamGradeSolutionFunc(courseId, taskId, selectedTeam?.id, distributionMode, setShowTeamGradeModal, gradeValue, setSelectedTeam);
    };

    const handleCaptainGradeDistribution = () => {
        handleCaptainGradeDistributionFunc(courseId, taskId, captainDistribution, setDistribution);
    };

    const handleOpenGradeModal = (team: CourseTeamDto) => {
        setSelectedTeam(team);
        setGradeValue(grade?.grade || 0);
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
        loadTeamGrade();
        loadDistribution();
        loadCaptains();
    }, []);

    return {
        state: { grade, distribution, showTeamGradeModal, selectedTeam, gradeValue, distributionMode, captains, showCaptainGradeModal, captainDistribution },
        functions: {
            handleOpenGradeModal,
            setShowTeamGradeModal,
            setGradeValue,
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