import { useEffect, useState } from "react";
import { apiRequestPreserveErrors } from "../../../api/client";
import { peer2peerService } from "../../../api/peer-to-peer";
import { SolutionDto } from "../../../types";
import { PeerReviewAssignmentDto, PeerReviewAssignmentStatus } from "../../../types/Peer2peer";

interface MyAssignmentItemProps {
    myAssignment: PeerReviewAssignmentDto;
    courseId: string | undefined;
    taskId: string | undefined;
}

const MyAssignmentItem: React.FC<MyAssignmentItemProps> = ({ myAssignment, courseId, taskId }) => {
    const [solution, setSolution] = useState<SolutionDto>();
    const [gradeValue, setGradeValue] = useState<number>(myAssignment.submittedGrade ?? 0);
    const [gradeComment, setGradeComment] = useState<string>(myAssignment.submittedComment ?? "");
    const [assignmentStatus, setAssignmentStatus] = useState<PeerReviewAssignmentStatus>(myAssignment.status);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formatDate = (date: Date | string | undefined) => {
        if (!date) return "Нет данных";
        return new Date(date).toLocaleDateString("ru-RU");
    };

    const isDeadlinePassed = !!myAssignment.firstDeadline && new Date() > new Date(myAssignment.firstDeadline);
    const isReadonly = assignmentStatus === "COMPLETED" || assignmentStatus === "MISSED" || isDeadlinePassed;

    const getSolution = async () => {
        if (!courseId || !taskId) return;

        try {
            const solutionResponse = await apiRequestPreserveErrors<SolutionDto>(
                `/courses/${courseId}/posts/${taskId}/solutions/${myAssignment.revieweeSolutionId}`
            );
            setSolution(solutionResponse);
        } catch (err: any) {
            console.error("Ошибка получения решения:", err);
            setSolution(undefined);
        }
    };

    const handleGradeSolution = async () => {
        if (!courseId || !taskId || isReadonly) return;

        if (!Number.isFinite(gradeValue) || gradeValue < 0 || gradeValue > 100) {
            alert("Оценка должна быть в диапазоне 0..100");
            return;
        }

        if (gradeComment.length > 5000) {
            alert("Комментарий не должен превышать 5000 символов");
            return;
        }

        try {
            setIsSubmitting(true);
            await peer2peerService.submitPeerReview(courseId, taskId, myAssignment.assignmentId, {
                grade: gradeValue,
                comment: gradeComment.trim() || undefined,
            });
            setAssignmentStatus("COMPLETED");
        } catch (err: any) {
            console.error("Failed to grade solution:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        getSolution();
    }, [courseId, taskId, myAssignment.revieweeSolutionId]);

    return (
        <div className="peer-review-assignment-card">
            <div className="peer-review-assignment-header">
                <div className="peer-review-assignment-meta">
                    <span>Раунд: {myAssignment.round}</span>
                    <span>Первый дедлайн: {formatDate(myAssignment.firstDeadline)}</span>
                    <span>Назначено: {formatDate(myAssignment.assignedAt)}</span>
                </div>
                <span className="peer-review-status">{assignmentStatus}</span>
            </div>

            <div className="peer-review-solution-preview">
                <span className="peer-review-solution-label">Решение</span>
                <div className="peer-review-solution-text">
                    {solution?.text || "Текст решения недоступен"}
                </div>
            </div>

            {assignmentStatus === "COMPLETED" && (
                <div className="peer-review-result">
                    <span>Ваша оценка: {gradeValue} / 100</span>
                    {gradeComment.trim() && <span>Комментарий: {gradeComment}</span>}
                </div>
            )}

            {isReadonly ? (
                <div className="peer-review-assignment-note">
                    {assignmentStatus === "MISSED"
                        ? "Срок p2p-проверки пропущен."
                        : isDeadlinePassed
                            ? "Дедлайн проверки прошел. Изменить оценку больше нельзя."
                            : "P2P-проверка уже отправлена."}
                </div>
            ) : (
                <div className="peer-review-form">
                    <div className="peer-review-field peer-review-field-score">
                        <label htmlFor={`grade-input-${myAssignment.assignmentId}`}>Оценка (0-100)</label>
                        <input
                            className="peer-review-input"
                            id={`grade-input-${myAssignment.assignmentId}`}
                            type="number"
                            min="0"
                            max="100"
                            value={gradeValue}
                            onChange={(e) => setGradeValue(Number(e.target.value))}
                        />
                    </div>

                    <div className="peer-review-field peer-review-field-comment">
                        <label htmlFor={`grade-comment-input-${myAssignment.assignmentId}`}>Комментарий (необязательно)</label>
                        <textarea
                            className="peer-review-textarea"
                            id={`grade-comment-input-${myAssignment.assignmentId}`}
                            value={gradeComment}
                            onChange={(e) => setGradeComment(e.target.value)}
                            maxLength={5000}
                            rows={4}
                            placeholder="Например: Хорошая работа"
                        />
                    </div>

                    <button
                        className="btn-primary peer-review-submit"
                        onClick={handleGradeSolution}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Сохранение..." : "Сохранить"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default MyAssignmentItem;
