import React, { useState, useEffect } from 'react';
import './AssignmentsTab.css';
import { PostDto, CourseRole, SolutionDto, PostType, SolutionStatus } from '../../types/api';
import { postsService, solutionsService } from '../../api/services';

interface AssignmentsTabProps {
  courseId: string;
  userRole: CourseRole;
}

export default function AssignmentsTab({ courseId, userRole }: AssignmentsTabProps) {
  const [assignments, setAssignments] = useState<PostDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<PostDto | null>(null);
  const [solutions, setSolutions] = useState<SolutionDto[]>([]);
  const [mySolution, setMySolution] = useState<SolutionDto | null>(null);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [solutionText, setSolutionText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<PostDto | null>(null);
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    content: '',
    deadline: ''
  });

  useEffect(() => {
    loadAssignments();
  }, [courseId]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const response = await postsService.listPosts(courseId, { type: 'TASK' });
      setAssignments(response.content);
    } catch (err: any) {
      console.error('Failed to load assignments:', err);
      alert(err.message || 'Ошибка загрузки заданий');
    } finally {
      setLoading(false);
    }
  };

  const loadMySolution = async (postId: string) => {
    try {
      const solution = await solutionsService.getMySolution(courseId, postId);
      setMySolution(solution);
      setSolutionText(solution.text || '');
    } catch (err: any) {
      setMySolution(null);
      setSolutionText('');
    }
  };

  const loadSolutions = async (postId: string) => {
    if (userRole !== 'TEACHER') {
      return;
    }
    try {
      const response = await solutionsService.listSolutions(courseId, postId);
      setSolutions(response.content);
    } catch (err: any) {
      console.error('Failed to load solutions:', err);
      alert(err.message || 'Ошибка загрузки решений');
    }
  };

  const handleSubmitSolution = async () => {
    if (!selectedAssignment) return;
    
    if (!solutionText.trim()) {
      alert('Введите текст решения');
      return;
    }

    try {
      const newSolution = await solutionsService.createSolution(courseId, selectedAssignment.id, {
        text: solutionText,
      });

      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          try {
            await solutionsService.uploadSolutionFile(courseId, selectedAssignment.id, newSolution.id, file);
          } catch (err) {
            console.error('Failed to upload file:', err);
          }
        }
      }

      await loadMySolution(selectedAssignment.id);
      
      setShowSubmitForm(false);
      setSolutionText('');
      setSelectedFiles([]);
    } catch (err: any) {
      console.error('Failed to submit solution:', err);
      alert(err.message || 'Ошибка отправки решения');
    }
  };

  const handleGradeSolution = async (solutionId: string, grade: number) => {
    if (!selectedAssignment || userRole !== 'TEACHER') return;

    try {
      await solutionsService.gradeSolution(courseId, selectedAssignment.id, solutionId, {
        grade,
      });
      
      await loadSolutions(selectedAssignment.id);
    } catch (err: any) {
      console.error('Failed to grade solution:', err);
      alert(err.message || 'Ошибка выставления оценки');
    }
  };

  const handleCreateAssignment = () => {
    setEditingAssignment(null);
    setAssignmentForm({ title: '', content: '', deadline: '' });
    setShowCreateAssignment(true);
  };

  const handleEditAssignment = (assignment: PostDto) => {
    setEditingAssignment(assignment);
    setAssignmentForm({
      title: assignment.title,
      content: assignment.content || '',
      deadline: assignment.deadline || ''
    });
    setShowCreateAssignment(true);
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить это задание?')) {
      try {
        await postsService.deletePost(courseId, assignmentId);
        setAssignments(assignments.filter(a => a.id !== assignmentId));
        if (selectedAssignment?.id === assignmentId) {
          closeAssignment();
        }
      } catch (err: any) {
        console.error('Failed to delete assignment:', err);
        alert(err.message || 'Ошибка удаления задания');
      }
    }
  };

  const handleSaveAssignment = async () => {
    if (!assignmentForm.title.trim()) {
      alert('Введите название задания');
      return;
    }
    if (!assignmentForm.deadline) {
      alert('Укажите срок сдачи');
      return;
    }

    try {
      if (editingAssignment) {
        const updatedPost = await postsService.updatePost(courseId, editingAssignment.id, {
          title: assignmentForm.title,
          content: assignmentForm.content || undefined,
          deadline: assignmentForm.deadline,
        });
        setAssignments(assignments.map(a => (a.id === editingAssignment.id ? updatedPost : a)));
      } else {
        const newPost = await postsService.createPost(courseId, {
          title: assignmentForm.title,
          content: assignmentForm.content || undefined,
          type: 'TASK',
          deadline: assignmentForm.deadline,
        });
        setAssignments([...assignments, newPost]);
      }

      setShowCreateAssignment(false);
    } catch (err: any) {
      console.error('Failed to save assignment:', err);
      alert(err.message || 'Ошибка сохранения задания');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const isPast = date < now;
    
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    
    return {
      text: date.toLocaleDateString('ru-RU', options),
      isPast
    };
  };

  const openAssignment = (assignment: PostDto) => {
    setSelectedAssignment(assignment);
    if (userRole === 'STUDENT') {
      loadMySolution(assignment.id);
    } else {
      loadSolutions(assignment.id);
    }
  };

  const closeAssignment = () => {
    setSelectedAssignment(null);
    setMySolution(null);
    setSolutions([]);
    setShowSubmitForm(false);
    setSolutionText('');
    setSelectedFiles([]);
  };

  if (selectedAssignment) {
    return (
      <div className="assignment-detail">
        <button className="back-button" onClick={closeAssignment}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Назад к заданиям
        </button>

        <div className="assignment-content">
          <div className="assignment-header">
            <div className="assignment-header-left">
              <h2>{selectedAssignment.title}</h2>
              {selectedAssignment.deadline && (
                <div className={`deadline ${formatDeadline(selectedAssignment.deadline).isPast ? 'past' : ''}`}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                  </svg>
                  Срок: {formatDeadline(selectedAssignment.deadline).text}
                </div>
              )}
            </div>
            {userRole === 'TEACHER' && (
              <div className="assignment-actions">
                <button 
                  className="icon-button"
                  onClick={() => handleEditAssignment(selectedAssignment)}
                  title="Редактировать"
                  data-testid="edit-assignment-button"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                </button>
                <button 
                  className="icon-button"
                  onClick={() => handleDeleteAssignment(selectedAssignment.id)}
                  title="Удалить"
                  data-testid="delete-assignment-button"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
          
          <div className="assignment-description">
            {selectedAssignment.content}
          </div>

          {selectedAssignment.materialsCount > 0 && (
            <div className="assignment-materials">
              <h3>Материалы</h3>
              {/* TODO: Load and display materials */}
              <p className="placeholder">Материалы загружаются...</p>
            </div>
          )}
        </div>

        {userRole === 'STUDENT' ? (
          <div className="student-section">
            {mySolution ? (
              <div className="my-solution">
                <div className="solution-header">
                  <h3>Ваше решение</h3>
                  <span className={`status-badge ${mySolution.status.toLowerCase()}`}>
                    {mySolution.status === 'SUBMITTED' ? 'Сдано' : 'Оценено'}
                  </span>
                </div>
                
                <div className="solution-text">{mySolution.text}</div>
                
                {mySolution.filesCount > 0 && (
                  <div className="solution-files">
                    <h4>Прикрепленные файлы</h4>
                    {/* TODO: Load and display files */}
                    <p className="placeholder">Файлы загружаются...</p>
                  </div>
                )}

                {mySolution.status === 'GRADED' && mySolution.grade !== undefined && (
                  <div className="solution-grade">
                    <strong>Оценка:</strong> {mySolution.grade} / 100
                    {mySolution.gradedAt && (
                      <span className="grade-date">
                        {new Date(mySolution.gradedAt).toLocaleDateString('ru-RU')}
                      </span>
                    )}
                  </div>
                )}

                <button 
                  className="edit-solution-button"
                  onClick={() => {
                    setSolutionText(mySolution.text);
                    setShowSubmitForm(true);
                  }}
                >
                  Изменить решение
                </button>
              </div>
            ) : showSubmitForm ? (
              <div className="submit-form">
                <h3>Сдать решение</h3>
                
                <textarea
                  className="solution-textarea"
                  placeholder="Введите ваше решение..."
                  value={solutionText}
                  onChange={(e) => setSolutionText(e.target.value)}
                  rows={8}
                />

                <div className="file-upload">
                  <input
                    type="file"
                    id="file-input"
                    multiple
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="file-input" className="file-upload-button">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                      <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
                    </svg>
                    Прикрепить файлы
                  </label>
                  {selectedFiles.length > 0 && (
                    <div className="selected-files">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="file-item">
                          <span>{file.name}</span>
                          <button onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== index))}>
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button className="cancel-button" onClick={() => {
                    setShowSubmitForm(false);
                    setSolutionText('');
                    setSelectedFiles([]);
                  }}>
                    Отмена
                  </button>
                  <button 
                    className="submit-button" 
                    onClick={handleSubmitSolution}
                    disabled={!solutionText.trim()}
                  >
                    Сдать решение
                  </button>
                </div>
              </div>
            ) : (
              <button className="start-submit-button" onClick={() => setShowSubmitForm(true)}>
                Сдать решение
              </button>
            )}
          </div>
        ) : (
          <div className="teacher-section">
            <h3>Решения студентов ({solutions.length})</h3>
            
            {solutions.length === 0 ? (
              <div className="no-solutions">
                <p>Пока нет сданных решений</p>
              </div>
            ) : (
              <div className="solutions-list">
                {solutions.map(solution => (
                  <div key={solution.id} className="solution-card">
                    <div className="solution-student">
                      <div className="student-avatar">
                        {solution.student.displayName.charAt(0)}
                      </div>
                      <div className="student-info">
                        <div className="student-name">{solution.student.displayName}</div>
                        <div className="solution-date">
                          Сдано: {new Date(solution.submittedAt).toLocaleDateString('ru-RU')}
                        </div>
                      </div>
                      <span className={`status-badge ${solution.status.toLowerCase()}`}>
                        {solution.status === 'SUBMITTED' ? 'Сдано' : 'Оценено'}
                      </span>
                    </div>

                    <div className="solution-content">
                      <p>{solution.text}</p>
                      {solution.filesCount > 0 && (
                        <div className="files-info">
                          📎 {solution.filesCount} файл(ов)
                        </div>
                      )}
                    </div>

                    {solution.status === 'GRADED' && solution.grade !== undefined ? (
                      <div className="graded-info">
                        <strong>Оценка: {solution.grade} / 100</strong>
                        {solution.gradedAt && (
                          <span className="grade-date">
                            {new Date(solution.gradedAt).toLocaleDateString('ru-RU')}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="grade-form">
                        <input 
                          type="number" 
                          min="0" 
                          max="100" 
                          placeholder="Оценка (0-100)"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const grade = parseInt((e.target as HTMLInputElement).value);
                              if (grade >= 0 && grade <= 100) {
                                handleGradeSolution(solution.id, grade);
                              }
                            }
                          }}
                        />
                        <button 
                          onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                            const grade = parseInt(input.value);
                            if (grade >= 0 && grade <= 100) {
                              handleGradeSolution(solution.id, grade);
                            }
                          }}
                        >
                          Выставить оценку
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="assignments-tab">
      <div className="assignments-header">
        <h2>Задания</h2>
        {userRole === 'TEACHER' && (
          <button 
            className="create-assignment-button"
            onClick={handleCreateAssignment}
            data-testid="create-assignment-button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            <span>Создать задание</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-state">Загрузка заданий...</div>
      ) : assignments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg viewBox="0 0 24 24" fill="#5f6368" width="80" height="80">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
          </div>
          <h3 className="empty-state-title">Заданий пока нет</h3>
          <p className="empty-state-description">
            Здесь будут появляться задания по курсу
          </p>
        </div>
      ) : (
        <div className="assignments-list">
          {assignments.map(assignment => {
            const deadlineInfo = assignment.deadline ? formatDeadline(assignment.deadline) : null;
            const hasSubmitted = assignment.mySolutionId !== null;

            return (
              <div 
                key={assignment.id} 
                className="assignment-card"
                onClick={() => openAssignment(assignment)}
              >
                <div className="assignment-card-header">
                  <h3>{assignment.title}</h3>
                  {hasSubmitted && (
                    <span className="submitted-badge">
                      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      Сдано
                    </span>
                  )}
                </div>

                <p className="assignment-preview">{assignment.content}</p>

                <div className="assignment-card-footer">
                  {deadlineInfo && (
                    <div className={`deadline ${deadlineInfo.isPast ? 'past' : ''}`}>
                      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                      </svg>
                      {deadlineInfo.text}
                    </div>
                  )}
                  
                  <div className="assignment-stats">
                    {assignment.materialsCount > 0 && (
                      <span>📎 {assignment.materialsCount}</span>
                    )}
                    {userRole === 'TEACHER' && (
                      <span>✓ {assignment.solutionsCount} решений</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Assignment Modal */}
      {showCreateAssignment && (
        <div className="modal-overlay" onClick={() => setShowCreateAssignment(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingAssignment ? 'Редактировать задание' : 'Создать задание'}</h2>
              <button className="close-button" onClick={() => setShowCreateAssignment(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="assignment-title">Название задания *</label>
                <input
                  id="assignment-title"
                  type="text"
                  value={assignmentForm.title}
                  onChange={e => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                  placeholder="Введите название задания"
                  data-testid="assignment-title-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="assignment-content">Описание задания</label>
                <textarea
                  id="assignment-content"
                  value={assignmentForm.content}
                  onChange={e => setAssignmentForm({ ...assignmentForm, content: e.target.value })}
                  placeholder="Введите описание задания"
                  rows={8}
                  data-testid="assignment-content-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="assignment-deadline">Срок сдачи *</label>
                <input
                  id="assignment-deadline"
                  type="datetime-local"
                  value={assignmentForm.deadline}
                  onChange={e => setAssignmentForm({ ...assignmentForm, deadline: e.target.value })}
                  data-testid="assignment-deadline-input"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="button-secondary" onClick={() => setShowCreateAssignment(false)}>
                Отмена
              </button>
              <button className="button-primary" onClick={handleSaveAssignment} data-testid="save-assignment-button">
                {editingAssignment ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
