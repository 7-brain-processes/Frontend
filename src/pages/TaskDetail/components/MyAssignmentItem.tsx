import { useEffect, useState } from "react";
import { PeerReviewAssignmentDto } from "../../../types/Peer2peer";
import { SolutionDto } from "../../../types";
import { solutionsService } from "../../../api/solutions";
import { peer2peerService } from "../../../api/peer-to-peer";

interface MyAssignmentItemProps {
    myAssignment: PeerReviewAssignmentDto;
    courseId: string | undefined;
    taskId: string | undefined;
}

const MyAssignmentItem: React.FC<MyAssignmentItemProps> = ({ myAssignment, courseId, taskId }) => {
    const formatDate = (date: (Date | string | undefined)) => {
        if (!date) return "Нет данных";
        return new Date(date).toLocaleDateString("ru-RU");
    };

    const [solution, setSolution] = useState<SolutionDto>();
    const [gradeValue, setGradeValue] = useState<number>(solution?.grade || 0);
    const [gradeComment, setGradeComment] = useState<string>('');

    const getSolution = async () => {
        if (!courseId || !taskId) return;

        try {
            const solutionResponse = await solutionsService.getSolution(courseId, taskId, myAssignment.revieweeSolutionId);
            setSolution(solutionResponse);
        } catch (err: any) {
            console.error('Ошибка получения решения:', err);
        }
    };

    const handleGradeSolution = async () => {
        if (!courseId || !taskId || !solution) return;

        if (!Number.isFinite(gradeValue) || gradeValue < 0 || gradeValue > 100) {
            alert('Оценка должна быть в диапазоне 0..100');
            return;
        }

        if (gradeComment.length > 5000) {
            alert('Комментарий не должен превышать 5000 символов');
            return;
        }

        try {
            await peer2peerService.submitPeerReview(courseId, taskId, solution.id, {
                grade: gradeValue,
                comment: gradeComment.trim() || undefined,
            });

            window.location.reload();
        } catch (err: any) {
            console.error('Failed to grade solution:', err);
        }
    };

    useEffect(() => {
        getSolution();
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: '16px', textAlign: 'left', alignItems: 'center', padding: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <span>Раунд: {myAssignment.round}</span>
                <span>Первый дедлайн: {formatDate(myAssignment.firstDeadline)}</span>
                <span>Решение: {solution?.text}</span>
                {solution?.grade &&
                    <span>Оценка: {solution.grade} / 100</span>
                }
                {new Date() > new Date(myAssignment.firstDeadline) ? (
                    <span>Дедлайн проверки прошел. Изменить оценку больше нельзя.</span>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                            <label htmlFor="grade-comment-input">Комментарий (необязательно)</label>
                            <textarea
                                id="grade-comment-input"
                                value={gradeComment}
                                onChange={(e) => setGradeComment(e.target.value)}
                                maxLength={5000}
                                rows={4}
                                placeholder="Например: Хорошая работа"
                            />
                        </div>
                        <button
                            className="btn-primary"
                            onClick={handleGradeSolution}
                        >
                            Сохранить
                        </button>
                    </div>
                )}
            </div>
            <span>{myAssignment.status}</span>
        </div>
    );
};

export default MyAssignmentItem;