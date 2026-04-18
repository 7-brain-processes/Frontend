import { useEffect } from "react";
import { FormControl, MenuItem, Select } from "@mui/material";
import { CourseTeamDto, PostDto } from "../../../types";
import { SetTeamGradeDistributionModeRequest, TeamGradeDistributionMode } from "../../../types/TeamGrade";
import '../AssignmentsTab.css';

interface GradeDialogProps {
    showTeamGradeModal: boolean;
    selectedTeam: CourseTeamDto | null;
    setShowTeamGradeModal: (showTeamGradeModal: boolean) => void;
    gradeValue: number;
    setGradeValue: (gradeValue: number) => void;
    commentValue?: string;
    setCommentValue?: (commentValue: string) => void;
    handleTeamGradeSolution: () => void;
    distributionMode: SetTeamGradeDistributionModeRequest;
    setDistributionMode: (distributionMode: SetTeamGradeDistributionModeRequest) => void;
    team: CourseTeamDto;
    teamFormationMode?: PostDto['teamFormationMode'];
}

const getAllowedDistributionModes = (teamFormationMode?: PostDto['teamFormationMode']): TeamGradeDistributionMode[] => {
    if (teamFormationMode === 'FREE' || teamFormationMode === 'RANDOM_SHUFFLE') {
        return ['AUTO_EQUAL', 'TEAM_VOTE'];
    }

    if (teamFormationMode === 'CAPTAIN_SELECTION' || teamFormationMode === 'DRAFT') {
        return ['AUTO_EQUAL', 'CAPTAIN_MANUAL', 'TEAM_VOTE'];
    }

    return ['MANUAL', 'AUTO_EQUAL', 'CAPTAIN_MANUAL', 'TEAM_VOTE'];
};

const distributionModeLabels: Record<TeamGradeDistributionMode, string> = {
    MANUAL: 'Ручное распределение',
    AUTO_EQUAL: 'Автоматически',
    CAPTAIN_MANUAL: 'Капитан вручную',
    TEAM_VOTE: 'Голосование команды',
};

const GradeDialog: React.FC<GradeDialogProps> = ({
    showTeamGradeModal,
    selectedTeam,
    setShowTeamGradeModal,
    gradeValue,
    setGradeValue,
    commentValue = '',
    setCommentValue,
    handleTeamGradeSolution,
    distributionMode,
    setDistributionMode,
    team,
    teamFormationMode,
}) => {
    const allowedDistributionModes = getAllowedDistributionModes(teamFormationMode);
    const effectiveDistributionMode = allowedDistributionModes.includes(distributionMode.distributionMode)
        ? distributionMode.distributionMode
        : allowedDistributionModes[0];

    useEffect(() => {
        if (!showTeamGradeModal) {
            return;
        }

        if (distributionMode.distributionMode !== effectiveDistributionMode) {
            setDistributionMode({ distributionMode: effectiveDistributionMode });
        }
    }, [showTeamGradeModal, distributionMode, effectiveDistributionMode, setDistributionMode]);

    return (
        <div>
            {showTeamGradeModal && selectedTeam && (
                <div className="modal-overlay" onClick={() => setShowTeamGradeModal(false)}>
                    <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Оценить команду</h2>
                            <button
                                className="close-button"
                                onClick={() => setShowTeamGradeModal(false)}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="student-info-modal">
                                <strong>{team.name}</strong>
                            </div>
                            <div className="form-group">
                                <label htmlFor="grade-input">Оценка (0-100)</label>
                                <input
                                    id="grade-input"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={gradeValue}
                                    onChange={(e) => setGradeValue(Number(e.target.value))}
                                />
                            </div>
                            {setCommentValue && (
                                <div className="form-group">
                                    <label htmlFor="grade-comment">Комментарий (необязательно)</label>
                                    <textarea
                                        id="grade-comment"
                                        value={commentValue}
                                        onChange={(e) => setCommentValue(e.target.value)}
                                        maxLength={5000}
                                        rows={4}
                                        placeholder="Например: Хорошая командная работа"
                                    />
                                </div>
                            )}
                            <div className="form-group">
                                <label htmlFor="assignment-deadline">Режим распределения оценки</label>
                                <FormControl fullWidth>
                                    <Select
                                        id="demo-simple-select"
                                        value={effectiveDistributionMode}
                                        onChange={(e) => setDistributionMode({
                                            distributionMode: e.target.value as TeamGradeDistributionMode
                                        })}
                                    >
                                        {allowedDistributionModes.map((mode) => (
                                            <MenuItem key={mode} value={mode}>
                                                {distributionModeLabels[mode]}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn-secondary"
                                onClick={() => setShowTeamGradeModal(false)}
                            >
                                Отмена
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleTeamGradeSolution}
                            >
                                Сохранить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GradeDialog;
