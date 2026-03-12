import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTaskDetailPage } from './hooks/useTaskDetailPage';
import { coursesService } from '../../api/services';
import { CourseRole } from '../../types/api';
import './TaskDetailPage.css';

const TaskDetailPage = () => {
  const { courseId } = useParams<{ courseId: string; taskId: string }>();
  const [userRole, setUserRole] = useState<CourseRole>('STUDENT');
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId) return;
      try {
        const course = await coursesService.getCourse(courseId);
        setUserRole(course.currentUserRole);
      } catch (err) {
        console.error('Failed to load course role:', err);
      } finally {
        setLoadingRole(false);
      }
    };

    loadCourse();
  }, [courseId]);

  const { state, functions } = useTaskDetailPage(userRole, loadingRole);

  if (loadingRole || state.loading) {
    return (
      <div className="task-detail-page">
        <div className="loading">Загрузка задания...</div>
      </div>
    );
  }

  if (!state.task) {
    return (
      <div className="task-detail-page">
        <div className="error">{state.error || 'Задание не найдено'}</div>
      </div>
    );
  }

  const deadline = state.task.deadline ? functions.formatDeadline(state.task.deadline) : null;
  const isLateSolution = (submittedAt: string) => {
    if (!state.task?.deadline) {
      return false;
    }

    return new Date(submittedAt).getTime() > new Date(state.task.deadline).getTime();
  };

  return (
    <div className="task-detail-page">
      {state.error && (
        <div className="offline-banner">
          ⚠️ {state.error}
        </div>
      )}

      <div className="task-detail-layout">
        <div className="task-main-content">
          <div className="task-card">
            <div className="task-header">
              <div className="task-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                </svg>
              </div>
              <div className="task-header-info">
                <h1 className="task-title">{state.task.title}</h1>
                <div className="task-meta">
                  <span className="task-author">{state.task.author.displayName}</span>
                  <span className="task-separator">•</span>
                  <span className="task-date">
                    {new Date(state.task.createdAt).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="task-info-row">
              {deadline && (
                <div className="task-deadline">
                  Срок сдачи: {deadline.text}
                </div>
              )}
            </div>

            {state.task.content && (
              <div className="task-description">
                <p>{state.task.content}</p>
              </div>
            )}
          </div>
        </div>

        {userRole === 'STUDENT' && (
          <div className="task-sidebar">
            <div className="sidebar-card">
              <div className="sidebar-header">
                <h3>Мои задания</h3>
                {state.mySolution && (
                  <span className="status-badge-done">Сдано</span>
                )}
              </div>

              {state.mySolution ? (
                <div className="sidebar-content">
                  <div className="solution-preview">
                    {state.mySolution.text && (
                      <div className="solution-text-preview">
                        {state.mySolution.text}
                      </div>
                    )}
                    {state.mySolutionFiles.length > 0 && (
                      <div className="solution-files-list">
                        {state.mySolutionFiles.map((file) => (
                          <div
                            key={file.id}
                            className="solution-file-item"
                            onClick={() => functions.handleDownloadFile(file.id, file.originalName)}
                          >
                            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                            </svg>
                            <span className="file-name">{file.originalName}</span>
                            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" className="download-icon">
                              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                            </svg>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {state.mySolution.grade !== null && (
                    <div className="solution-grade-display">
                      Оценка: {state.mySolution.grade} / 100
                    </div>
                  )}
                  <div className="solution-comments-block">
                    <h4>Комментарии преподавателя</h4>
                    {state.mySolutionComments.length === 0 ? (
                      <div className="solution-comments-empty">Комментариев нет</div>
                    ) : (
                      <div className="solution-comments-list">
                        {state.mySolutionComments.map((comment) => (
                          <div key={comment.id} className="solution-comment-item">
                            <div className="solution-comment-meta">
                              <strong>{comment.author.displayName}</strong>
                              <span>
                                {new Date(comment.createdAt).toLocaleDateString('ru-RU', {
                                  day: 'numeric',
                                  month: 'long',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <div className="solution-comment-text">{comment.text}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {state.mySolution.grade === null && state.mySolution.status !== 'GRADED' && (
                    <button
                      className="btn-cancel-submit"
                      onClick={functions.handleCancelSubmit}
                    >
                      Отменить отправку
                    </button>
                  )}
                </div>
              ) : state.showSubmitForm ? (
                <div className="sidebar-content">
                  <div className="submit-form">
                    <textarea
                      value={state.solutionText}
                      onChange={(e) => functions.setSolutionText(e.target.value)}
                      placeholder="Введите текст решения..."
                      rows={8}
                      className="solution-textarea"
                    />
                    <div className="file-upload">
                      <input
                        type="file"
                        multiple
                        onChange={functions.handleFileSelect}
                        id="solution-files"
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="solution-files" className="btn-file">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                          <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z" />
                        </svg>
                        Добавить
                      </label>
                    </div>
                    {state.selectedFiles.length > 0 && (
                      <div className="selected-files">
                        {state.selectedFiles.map((file, index) => (
                          <div key={index} className="file-item">
                            <span>{file.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="form-actions">
                      <button
                        className="btn-cancel"
                        onClick={() => functions.setShowSubmitForm(false)}
                        disabled={state.loading}
                      >
                        Отмена
                      </button>
                      <button
                        className="btn-submit"
                        onClick={functions.handleSubmitSolution}
                        disabled={state.loading}
                      >
                        {state.loading ? 'Отправка...' : 'Сдать'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="sidebar-content">
                  <button
                    className="btn-add-work"
                    onClick={() => functions.setShowSubmitForm(true)}
                  >
                    + Добавить работу
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {userRole === 'TEACHER' && (
          <div className="teacher-section">
            <h3>Решения студентов ({state.solutions.length})</h3>
            {state.solutions.length === 0 ? (
              <div className="empty-solutions">
                <p>Пока нет отправленных решений</p>
              </div>
            ) : (
              <div className="solutions-list">
                {state.solutions.map((solution) => {
                  const lateSubmission = isLateSolution(solution.submittedAt);

                  return (
                    <div key={solution.id} className={`solution-card ${lateSubmission ? 'late' : ''}`}>
                      <div className="solution-header">
                        <div className="student-info">
                          <div className="student-avatar">
                            {solution.student.displayName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="student-name">{solution.student.displayName}</div>
                            <div className="solution-date">
                              {new Date(solution.submittedAt).toLocaleDateString('ru-RU', {
                                day: 'numeric',
                                month: 'long',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                              {lateSubmission && <span className="late-submission-text"> • После срока</span>}
                            </div>
                          </div>
                        </div>
                        {lateSubmission && (
                          <span className="late-submission-badge">Сдано с опозданием</span>
                        )}
                      </div>
                      {solution.text && (
                        <div className="solution-text">
                          <p>{solution.text}</p>
                        </div>
                      )}
                      {solution.filesCount > 0 && state.solutionFiles[solution.id] && state.solutionFiles[solution.id].length > 0 && (
                        <div className="solution-files-list">
                          {state.solutionFiles[solution.id].map((file) => (
                            <div
                              key={file.id}
                              className="solution-file-item"
                              onClick={() => functions.handleDownloadSolutionFile(solution.id, file.id, file.originalName)}
                            >
                              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                              </svg>
                              <span className="file-name">{file.originalName}</span>
                              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" className="download-icon">
                                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                              </svg>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="solution-meta">
                        {solution.grade !== null && (
                          <span className="grade-value">{solution.grade}</span>
                        )}
                        <button
                          className="btn-secondary btn-edit-grade"
                          onClick={() => functions.handleOpenGradeModal(solution)}
                        >
                          {solution.grade !== null ? 'Изменить' : 'Оценить'}
                        </button>
                      </div>
                      <div className="solution-comments-block">
                        <h4>Комментарии к работе</h4>
                        {state.solutionComments[solution.id]?.length ? (
                          <div className="solution-comments-list">
                            {state.solutionComments[solution.id].map((comment) => (
                              <div key={comment.id} className="solution-comment-item">
                                <div className="solution-comment-meta">
                                  <strong>{comment.author.displayName}</strong>
                                  <span>
                                    {new Date(comment.createdAt).toLocaleDateString('ru-RU', {
                                      day: 'numeric',
                                      month: 'long',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                                <div className="solution-comment-text">{comment.text}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="solution-comments-empty">Комментариев пока нет</div>
                        )}
                        <div className="solution-comment-form">
                          <textarea
                            value={state.commentInputs[solution.id] || ''}
                            onChange={(e) => functions.handleCommentInputChange(solution.id, e.target.value)}
                            placeholder="Напишите комментарий к решению"
                            rows={3}
                            className="solution-comment-textarea"
                          />
                          <button
                            className="btn-primary btn-comment"
                            onClick={() => functions.handleCreateSolutionComment(solution.id)}
                            disabled={state.submittingCommentId === solution.id}
                          >
                            {state.submittingCommentId === solution.id ? 'Отправка...' : 'Добавить комментарий'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {state.showGradeModal && state.selectedSolution && (
        <div className="modal-overlay" onClick={() => functions.setShowGradeModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Оценить решение</h2>
              <button
                className="close-button"
                onClick={() => functions.setShowGradeModal(false)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="student-info-modal">
                <strong>{state.selectedSolution.student.displayName}</strong>
              </div>
              <div className="form-group">
                <label htmlFor="grade-input">Оценка (0-100)</label>
                <input
                  id="grade-input"
                  type="number"
                  min="0"
                  max="100"
                  value={state.gradeValue}
                  onChange={(e) => functions.setGradeValue(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="modal-footer">
              {state.selectedSolution.grade !== null && (
                <button
                  className="btn-secondary"
                  onClick={functions.handleRemoveGrade}
                >
                  Снять оценку
                </button>
              )}
              <button
                className="btn-secondary"
                onClick={() => functions.setShowGradeModal(false)}
              >
                Отмена
              </button>
              <button
                className="btn-primary"
                onClick={functions.handleGradeSolution}
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

export default TaskDetailPage;
