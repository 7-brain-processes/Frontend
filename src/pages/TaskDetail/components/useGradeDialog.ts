import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SetTeamGradeDistributionModeRequest, TeamGradeDistributionDto, TeamGradeDto } from "../../../types/TeamGrade";
import { teamGradesService } from "../../../api/teamGrades";
import { CourseTeamDto } from "../../../types/Team";

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
        setDistribution(distribution);
    } catch (err: any) {
        console.error('Failed to load course:', err);
        alert(err.message || 'Ошибка загрузки режима распределения оценки команды');
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

export const useGradeDialog = () => {
    const { courseId, taskId } = useParams<{ courseId: string; taskId: string }>();
    const [grade, setGrade] = useState<TeamGradeDto | null>(null);
    const [distributionMode, setDistributionMode] = useState<SetTeamGradeDistributionModeRequest>({
        distributionMode: 'MANUAL'
    });
    const [distribution, setDistribution] = useState<TeamGradeDistributionDto | null>(null);
    const [showTeamGradeModal, setShowTeamGradeModal] = useState<boolean>(false);
    const [gradeValue, setGradeValue] = useState<number>(0);
    const [selectedTeam, setSelectedTeam] = useState<CourseTeamDto | null>(null);

    const loadTeamGrade = () => {
        loadTeamGradeFunc(courseId, taskId, selectedTeam?.id, setGrade);
    };

    const loadDistribution = () => {
        loadDistributionFunc(courseId, taskId, selectedTeam?.id, setDistribution);
    }

    const handleTeamGradeSolution = () => {
        handleTeamGradeSolutionFunc(courseId, taskId, selectedTeam?.id, distributionMode, setShowTeamGradeModal, gradeValue, setSelectedTeam);
    };

    const handleOpenGradeModal = (team: CourseTeamDto) => {
        setSelectedTeam(team);
        setGradeValue(grade?.grade || 0);
        setShowTeamGradeModal(true);
    };

    useEffect(() => {
        loadTeamGrade();
        loadDistribution();
    }, []);

    return {
        state: {},
        functions: {}
    }
}