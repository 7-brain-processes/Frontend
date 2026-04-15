import { CaptainGradeDistributionRequest } from "../../../types/TeamGrade";
import '../AssignmentsTab.css';

interface CaptainMember {
    user: {
        id: string;
        displayName: string;
    };
}

interface CaptainGradeDialogProps {
    showCaptainGradeModal: boolean;
    setShowCaptainGradeModal: (showCaptainGradeModal: boolean) => void;
    handleCaptainGradeDistribution: () => void;
    members: CaptainMember[];
    setCaptainDistribution: (captainDistribution: CaptainGradeDistributionRequest) => void;
    captainDistribution: CaptainGradeDistributionRequest;
    handleGradeChange: (studentId: string, value: string) => void;
}

const CaptainGradeDialog: React.FC<CaptainGradeDialogProps> = ({ showCaptainGradeModal, setShowCaptainGradeModal, handleCaptainGradeDistribution, members, setCaptainDistribution, captainDistribution, handleGradeChange }) => {
    const filledGradesCount = captainDistribution.grades.filter((item) => Number.isFinite(item.grade) && item.grade > 0).length;

    return (
        <div>
            {showCaptainGradeModal && (
                <div className="modal-overlay" onClick={() => setShowCaptainGradeModal(false)}>
                    <div className="modal-dialog captain-grade-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="captain-grade-header-content">
                                <h2>Распределение оценки команды</h2>
                                <p>Заполнено оценок: {filledGradesCount} из {members.length}</p>
                            </div>
                            <button
                                className="close-button"
                                onClick={() => setShowCaptainGradeModal(false)}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body captain-grade-body">
                            <div className="captain-grade-hint">
                                Введите индивидуальную оценку для каждого участника команды.
                            </div>
                            {members.map((member) => {
                                const currentGrade = captainDistribution.grades.find(g => g.studentId === member.user.id);
                                return (
                                    <div key={member.user.id} className="captain-grade-row">
                                        <div className="captain-grade-student">
                                            <span className="captain-grade-name">{member.user.displayName}</span>
                                        </div>
                                        <div className="captain-grade-input-wrap">
                                            <input
                                                className="captain-grade-input"
                                                type="number"
                                                min="0"
                                                value={currentGrade?.grade ?? ""}
                                                onChange={(e) => handleGradeChange(member.user.id, e.target.value)}
                                                placeholder="0"
                                            />
                                            <span className="captain-grade-input-label">баллов</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn-secondary"
                                onClick={() => setCaptainDistribution({ grades: [] })}
                            >
                                Сбросить
                            </button>
                            <button
                                className="btn-secondary"
                                onClick={() => setShowCaptainGradeModal(false)}
                            >
                                Отмена
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleCaptainGradeDistribution}
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

export default CaptainGradeDialog;