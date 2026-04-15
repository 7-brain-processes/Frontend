import { MemberDto } from "../../../types";
import { CaptainGradeDistributionRequest } from "../../../types/TeamGrade";
import '../AssignmentsTab.css';

interface CaptainGradeDialogProps {
    showCaptainGradeModal: boolean;
    setShowCaptainGradeModal: (showCaptainGradeModal: boolean) => void;
    handleCaptainGradeDistribution: () => void;
    members: MemberDto[];
    setCaptainDistribution: (captainDistribution: CaptainGradeDistributionRequest) => void;
    captainDistribution: CaptainGradeDistributionRequest;
    handleGradeChange: (studentId: string, value: string) => void;
}

const CaptainGradeDialog: React.FC<CaptainGradeDialogProps> = ({ showCaptainGradeModal, setShowCaptainGradeModal, handleCaptainGradeDistribution, members, setCaptainDistribution, captainDistribution, handleGradeChange }) => {
    return (
        <div>
            {showCaptainGradeModal && (
                <div className="modal-overlay" onClick={() => setShowCaptainGradeModal(false)}>
                    <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Распределить оценки</h2>
                            <button
                                className="close-button"
                                onClick={() => setShowCaptainGradeModal(false)}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body">
                            {members.map((member) => {
                                const currentGrade = captainDistribution.grades.find(g => g.studentId === member.user.id);
                                return (
                                    <div key={member.user.id}>
                                        <span>{member.user.displayName}</span>
                                        <input
                                            type="number"
                                            min="0"
                                            value={currentGrade?.grade ?? ""}
                                            onChange={(e) => handleGradeChange(member.user.id, e.target.value)}
                                            placeholder="Оценка"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                        <div className="modal-footer">
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