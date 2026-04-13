import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTaskDetailPage } from './hooks/useTaskDetailPage';
import { coursesService } from '../../api/services';
import { CourseRole } from '../../types/api';
import './TaskDetailPage.css';

const translateTeamFormationMode = {
  FREE: 'самостоятельное',
  DRAFT: 'драфт',
  CAPTAIN_SELECTION: 'драфт',
  RANDOM_SHUFFLE: 'рандомное'
} as const;

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

  const formatTeamCapacity = (currentMembers: number, maxSize: number | null) => {
    if (maxSize !== null) {
      return `${currentMembers} / ${maxSize}`;
    }

    return 'без лимита';
  };

  const formatJoinedAt = (joinedAt: string) => {
    return new Date(joinedAt).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTeamCreatedAt = (createdAt: string) => {
    return new Date(createdAt).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatAutoFormationStudent = (student: { displayName: string; username: string }) => {
    return student.displayName || student.username;
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

            {state.task.teamFormationMode && (
              <div className="task-description">
                <p className="assignment-preview">
                  Распределение по командам: {translateTeamFormationMode[state.task.teamFormationMode]}
                </p>
              </div>
            )}

            {userRole === 'STUDENT' && state.task.teamFormationMode === 'FREE' && (
              <div className="task-description teams-section">
                <div className="teams-section-header">
                  <h3>Команды задания</h3>
                  <p>Вы можете посмотреть доступные команды, вступить в подходящую и выйти из текущей команды.</p>
                </div>

                {state.teamActionSuccess && (
                  <div className="teams-state teams-state-success">{state.teamActionSuccess}</div>
                )}

                {state.teamActionError && (
                  <div className="teams-state teams-state-error">
                    <span>{state.teamActionError}</span>
                  </div>
                )}

                <div className="current-team-panel">
                  <div className="current-team-header">
                    <h4>Моя команда</h4>
                  </div>

                  {state.currentTeamLoading ? (
                    <div className="teams-state">Загрузка текущей команды...</div>
                  ) : state.currentTeamError ? (
                    <div className="teams-state teams-state-error">
                      <span>{state.currentTeamError}</span>
                    </div>
                  ) : !state.currentTeam ? (
                    <div className="teams-state">Вы пока не состоите ни в одной команде</div>
                  ) : (
                    <div className="team-card team-card-current">
                      <div className="team-card-header">
                        <div>
                          <h4 className="team-name">{state.currentTeam.teamName}</h4>
                          <div className="team-capacity">
                            Участники: {formatTeamCapacity(state.currentTeam.membersCount, state.currentTeam.maxSize)}
                          </div>
                          <div className="team-joined-at">
                            Вступили: {formatJoinedAt(state.currentTeam.joinedAt)}
                          </div>
                        </div>

                        <button
                          type="button"
                          className="btn-secondary btn-small"
                          onClick={() => functions.handleLeaveTeam(state.currentTeam!.teamId)}
                          disabled={state.actionTeamId === state.currentTeam.teamId}
                        >
                          {state.actionTeamId === state.currentTeam.teamId ? 'Выход...' : 'Выйти'}
                        </button>
                      </div>

                      <div className="team-members-section">
                        <span className="team-categories-label">Участники команды:</span>
                        <div className="team-members-list">
                          {state.currentTeam.members.map((member) => (
                            <div key={member.user.id} className="team-member-row">
                              <span className="team-member-name">{member.user.displayName}</span>
                              {member.category && (
                                <span className="team-member-category">{member.category.title}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="available-teams-panel">
                  <div className="current-team-header">
                    <h4>Доступные команды</h4>
                  </div>

                  {state.teamsLoading ? (
                    <div className="teams-state">Загрузка доступных команд...</div>
                  ) : state.teamsError ? (
                    <div className="teams-state teams-state-error">
                      <span>{state.teamsError}</span>
                      <button
                        type="button"
                        className="btn-secondary btn-small"
                        onClick={functions.retryLoadTeams}
                      >
                        Повторить
                      </button>
                    </div>
                  ) : state.availableTeams.length === 0 ? (
                    <div className="teams-state">Доступных команд пока нет</div>
                  ) : (
                    <div className="teams-list">
                      {state.availableTeams.map((team) => {
                        const hasAnotherCurrentTeam =
                          !!state.currentTeam && state.currentTeam.teamId !== team.id;
                        const enrollDisabled =
                          team.isFull ||
                          team.isStudentMember ||
                          hasAnotherCurrentTeam ||
                          state.actionTeamId === team.id;

                        return (
                          <div
                            key={team.id}
                            className={`team-card ${team.isStudentMember ? 'team-card-current' : ''}`}
                          >
                            <div className="team-card-header">
                              <div>
                                <h4 className="team-name">{team.name}</h4>
                                <div className="team-capacity">
                                  Участники: {formatTeamCapacity(team.currentMembers, team.maxSize)}
                                </div>
                                <div className="team-created-at">
                                  Создана: {formatTeamCreatedAt(team.createdAt)}
                                </div>
                              </div>

                              <div className="team-badges">
                                {team.isStudentMember && (
                                  <span className="team-badge team-badge-current">Вы уже в этой команде</span>
                                )}
                                {hasAnotherCurrentTeam && (
                                  <span className="team-badge team-badge-locked">Сначала выйдите из текущей команды</span>
                                )}
                                {team.isFull && (
                                  <span className="team-badge team-badge-full">Команда заполнена</span>
                                )}
                              </div>
                            </div>

                            {team.categories.length > 0 && (
                              <div className="team-categories">
                                <span className="team-categories-label">Категории:</span>
                                <div className="team-categories-list">
                                  {team.categories.map((category) => (
                                    <span key={category.id} className="team-category-chip">
                                      {category.title}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="team-actions">
                              <button
                                type="button"
                                className="btn-primary btn-small"
                                onClick={() => functions.handleEnrollInTeam(team.id)}
                                disabled={enrollDisabled}
                              >
                                {state.actionTeamId === team.id ? 'Вступление...' : 'Вступить'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {userRole === 'TEACHER' && state.task.teamFormationMode === 'RANDOM_SHUFFLE' && (
              <div className="task-description auto-formation-section">
                <div className="auto-formation-header">
                  <div>
                    <h3>Автоматическое формирование команд</h3>
                    <p>Задайте параметры распределения и при необходимости перезапустите формирование.</p>
                  </div>
                  <div className="auto-formation-header-actions">
                    <button
                      type="button"
                      className="btn-secondary btn-small"
                      onClick={functions.retryLoadAutoFormation}
                      disabled={state.autoFormationLoading || state.autoFormationSubmitting}
                    >
                      Обновить
                    </button>
                    <button
                      type="button"
                      className="btn-secondary btn-small"
                      onClick={() => functions.handleRunAutoFormation(true)}
                      disabled={state.autoFormationSubmitting}
                    >
                      {state.autoFormationSubmitting ? 'Повторный запуск...' : 'Запустить повторно'}
                    </button>
                  </div>
                </div>

                {state.autoFormationSuccess && (
                  <div className="teams-state teams-state-success">{state.autoFormationSuccess}</div>
                )}

                {state.autoFormationError && (
                  <div className="teams-state teams-state-error">
                    <span>{state.autoFormationError}</span>
                  </div>
                )}

                <div className="auto-formation-form">
                  <div className="auto-formation-grid">
                    <label className="auto-formation-field">
                      <span>Минимальный размер</span>
                      <input
                        type="number"
                        min="1"
                        value={state.autoFormationForm.minTeamSize}
                        onChange={(e) => functions.handleAutoFormationFieldChange('minTeamSize', Number(e.target.value))}
                      />
                    </label>

                    <label className="auto-formation-field">
                      <span>Максимальный размер</span>
                      <input
                        type="number"
                        min="1"
                        value={state.autoFormationForm.maxTeamSize}
                        onChange={(e) => functions.handleAutoFormationFieldChange('maxTeamSize', Number(e.target.value))}
                      />
                    </label>
                  </div>

                  <div className="auto-formation-options">
                    <label className="auto-checkbox">
                      <input
                        type="checkbox"
                        checked={state.autoFormationForm.balanceByCategory}
                        onChange={(e) => functions.handleAutoFormationFieldChange('balanceByCategory', e.target.checked)}
                      />
                      <span>Балансировать по категориям</span>
                    </label>

                    <label className="auto-checkbox">
                      <input
                        type="checkbox"
                        checked={state.autoFormationForm.balanceByRole}
                        onChange={(e) => functions.handleAutoFormationFieldChange('balanceByRole', e.target.checked)}
                      />
                      <span>Балансировать по ролям</span>
                    </label>
                  </div>

                  <div className="auto-formation-actions">
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => functions.handleRunAutoFormation(false)}
                      disabled={state.autoFormationSubmitting}
                    >
                      {state.autoFormationSubmitting ? 'Запуск...' : 'Запустить формирование'}
                    </button>
                  </div>
                </div>

                {state.autoFormationLoading ? (
                  <div className="teams-state">Загрузка данных автоформирования...</div>
                ) : (
                  <div className="auto-formation-panels">
                    <div className="auto-panel">
                      <h4>Результат</h4>
                      {!state.autoFormationResult ? (
                        <div className="teams-state">Формирование ещё не запускалось или результат недоступен.</div>
                      ) : (
                        <div className="auto-summary">
                          <div className="auto-summary-item">
                            <strong>{state.autoFormationResult.teamCount}</strong>
                            <span>Команд</span>
                          </div>
                          <div className="auto-summary-item">
                            <strong>{state.autoFormationResult.assignedStudentsCount}</strong>
                            <span>Распределено</span>
                          </div>
                          <div className="auto-summary-item">
                            <strong>{state.autoFormationResult.unassignedStudentsCount}</strong>
                            <span>Нераспределено</span>
                          </div>
                        </div>
                      )}

                      {state.autoFormationResult?.teams && state.autoFormationResult.teams.length > 0 ? (
                        <div className="auto-generated-teams">
                          {state.autoFormationResult.teams.map((team) => (
                            <div key={team.teamId} className="team-card">
                              <div className="team-name">{team.teamName}</div>
                              <div className="team-capacity">
                                Участники: {formatTeamCapacity(team.membersCount, team.maxSize)}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : state.autoFormationResult ? (
                        <div className="auto-note">
                          Backend вернул только сводный результат без полного списка команд. Для `7141` может понадобиться отдельный endpoint.
                        </div>
                      ) : null}
                    </div>

                    <div className="auto-panel">
                      <h4>Нераспределенные студенты</h4>
                      {state.autoFormationStudents.length === 0 ? (
                        <div className="teams-state">Нераспределенных студентов нет.</div>
                      ) : (
                        <div className="auto-students-list">
                          {state.autoFormationStudents.map((student) => (
                            <div key={student.userId} className="auto-student-item">
                              <span className="auto-student-name">{formatAutoFormationStudent(student)}</span>
                              {student.category && (
                                <span className="team-member-category">{student.category.title}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {(state.task.teamFormationMode === 'CAPTAIN_SELECTION' || state.task.teamFormationMode === 'DRAFT') && (
              <div className="task-description captains-section">
                <div className="captains-header">
                  <div>
                    <h3>Сценарий капитанов</h3>
                    <p>
                      {userRole === 'TEACHER'
                        ? 'Выберите капитанов для драфта и при необходимости перезапустите выбор.'
                        : 'Ниже показаны выбранные капитаны. Если вы среди них, вы сможете формировать свою команду на следующем этапе.'}
                    </p>
                  </div>

                  {userRole === 'TEACHER' && (
                    <div className="captains-actions">
                      <button
                        type="button"
                        className="btn-secondary btn-small"
                        onClick={functions.retryLoadCaptains}
                        disabled={state.captainsLoading || state.captainsSubmitting}
                      >
                        Обновить
                      </button>
                      <button
                        type="button"
                        className="btn-secondary btn-small"
                        onClick={() => functions.handleSelectCaptains(true)}
                        disabled={state.captainsSubmitting}
                      >
                        {state.captainsSubmitting ? 'Повторный выбор...' : 'Выбрать заново'}
                      </button>
                      <button
                        type="button"
                        className="btn-primary btn-small"
                        onClick={() => functions.handleSelectCaptains(false)}
                        disabled={state.captainsSubmitting}
                      >
                        {state.captainsSubmitting ? 'Выбор...' : 'Выбрать капитанов'}
                      </button>
                    </div>
                  )}
                </div>

                {state.isCurrentUserCaptain && (
                  <div className="captain-role-banner">
                    Вы выбраны капитаном. После подключения приглашений сможете собирать свою команду здесь.
                  </div>
                )}

                {!state.isCurrentUserCaptain && userRole === 'STUDENT' && (
                  <div className="student-draft-banner">
                    Если капитан пригласит вас в команду, приглашение появится ниже.
                  </div>
                )}

                {state.captainsSuccess && (
                  <div className="teams-state teams-state-success">{state.captainsSuccess}</div>
                )}

                {state.captainInviteSuccess && (
                  <div className="teams-state teams-state-success">{state.captainInviteSuccess}</div>
                )}

                {(state.captainsError || state.captainInviteError) && (
                  <div className="teams-state teams-state-error">
                    <span>{state.captainsError || state.captainInviteError}</span>
                  </div>
                )}

                {state.captainsLoading ? (
                  <div className="teams-state">Загрузка списка капитанов...</div>
                ) : state.captains.length === 0 ? (
                  <div className="teams-state">Капитаны пока не выбраны.</div>
                ) : (
                  <div className="captains-list">
                    {state.captains.map((captain) => {
                      const isCurrentUserCaptain = state.currentUser?.id === captain.userId;

                      return (
                        <div key={captain.userId} className={`captain-card ${isCurrentUserCaptain ? 'captain-card-current' : ''}`}>
                          <div className="captain-main">
                            <div className="captain-name-row">
                              <strong>{captain.displayName}</strong>
                              {isCurrentUserCaptain && (
                                <span className="captain-badge">Вы капитан</span>
                              )}
                            </div>
                            <div className="captain-username">@{captain.username}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {state.isCurrentUserCaptain && (
                  <div className="captain-flow">
                    <div className="captain-flow-header">
                      <h4>Управление командой капитана</h4>
                      <button
                        type="button"
                        className="btn-secondary btn-small"
                        onClick={functions.retryLoadCaptainFlow}
                        disabled={state.captainTeamLoading || state.captainStudentsLoading}
                      >
                        Обновить данные
                      </button>
                    </div>

                    <div className="captain-flow-grid">
                      <div className="captain-panel">
                        <h5>Текущий состав команды</h5>
                        {state.captainTeamLoading ? (
                          <div className="teams-state">Загрузка команды капитана...</div>
                        ) : !state.captainTeam ? (
                          <div className="teams-state">Команда капитана пока недоступна.</div>
                        ) : (
                          <div className="team-card team-card-current">
                            <div className="team-card-header">
                              <div>
                                <h4 className="team-name">{state.captainTeam.teamName}</h4>
                                <div className="team-capacity">
                                  Участники: {formatTeamCapacity(state.captainTeam.membersCount, state.captainTeam.maxSize)}
                                </div>
                              </div>
                            </div>

                            <div className="team-members-section">
                              <span className="team-categories-label">Участники команды:</span>
                              <div className="team-members-list">
                                {state.captainTeam.members.map((member) => (
                                  <div key={member.user.id} className="team-member-row">
                                    <span className="team-member-name">{member.user.displayName}</span>
                                    {member.category && (
                                      <span className="team-member-category">{member.category.title}</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="captain-panel">
                        <h5>Доступные студенты для приглашения</h5>
                        {state.captainStudentsLoading ? (
                          <div className="teams-state">Загрузка списка студентов...</div>
                        ) : state.captainStudents.length === 0 ? (
                          <div className="teams-state">Доступных студентов для приглашения пока нет.</div>
                        ) : (
                          <div className="captain-students-list">
                            {state.captainStudents.map((student) => (
                              <div key={student.userId} className="captain-student-card">
                                <div className="captain-student-main">
                                  <div className="captain-student-name">{formatAutoFormationStudent(student)}</div>
                                  <div className="captain-student-meta">@{student.username}</div>
                                </div>
                                <div className="captain-student-actions">
                                  {student.category && (
                                    <span className="team-member-category">{student.category.title}</span>
                                  )}
                                  <button
                                    type="button"
                                    className="btn-primary btn-small"
                                    onClick={() => functions.handleSendCaptainInvitation(student.userId)}
                                    disabled={state.captainInviteSubmittingId === student.userId}
                                  >
                                    {state.captainInviteSubmittingId === student.userId ? 'Отправка...' : 'Пригласить'}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {!state.isCurrentUserCaptain && userRole === 'STUDENT' && (
                  <div className="student-invitations-section">
                    <div className="captain-flow-header">
                      <h4>Входящие приглашения</h4>
                      <button
                        type="button"
                        className="btn-secondary btn-small"
                        onClick={functions.retryLoadStudentInvitations}
                        disabled={state.studentInvitationsLoading || !!state.studentInvitationActionId}
                      >
                        Обновить
                      </button>
                    </div>

                    {state.studentInvitationsSuccess && (
                      <div className="teams-state teams-state-success">{state.studentInvitationsSuccess}</div>
                    )}

                    {state.studentInvitationsError && (
                      <div className="teams-state teams-state-error">
                        <span>{state.studentInvitationsError}</span>
                      </div>
                    )}

                    {state.studentInvitationsLoading ? (
                      <div className="teams-state">Загрузка приглашений...</div>
                    ) : state.studentInvitations.length === 0 ? (
                      <div className="teams-state">Приглашений пока нет.</div>
                    ) : (
                      <div className="student-invitations-list">
                        {state.studentInvitations.map((invitation) => {
                          const isPending = invitation.status.toUpperCase() === 'PENDING';
                          const actionInProgress = state.studentInvitationActionId === invitation.id;

                          return (
                            <div key={invitation.id} className="student-invitation-card">
                              <div className="student-invitation-main">
                                <div className="student-invitation-title">
                                  Команда: <strong>{invitation.team.teamName}</strong>
                                </div>
                                <div className="student-invitation-meta">
                                  Капитан: {invitation.captain.displayName}
                                </div>
                                <div className="student-invitation-meta">
                                  Статус: {invitation.status}
                                </div>
                              </div>

                              {isPending && (
                                <div className="student-invitation-actions">
                                  <button
                                    type="button"
                                    className="btn-secondary btn-small"
                                    onClick={() => functions.handleRespondToInvitation(invitation.id, 'decline')}
                                    disabled={actionInProgress}
                                  >
                                    {actionInProgress ? 'Обработка...' : 'Отклонить'}
                                  </button>
                                  <button
                                    type="button"
                                    className="btn-primary btn-small"
                                    onClick={() => functions.handleRespondToInvitation(invitation.id, 'accept')}
                                    disabled={actionInProgress}
                                  >
                                    {actionInProgress ? 'Обработка...' : 'Принять'}
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {state.taskMaterials.length > 0 && (
              <div className="task-materials">
                <h3>Файлы задания</h3>
                <div className="task-materials-list">
                  {state.taskMaterials.map((file) => (
                    <button
                      key={file.id}
                      type="button"
                      className="task-material-item"
                      onClick={() => functions.handleDownloadTaskMaterial(file.id, file.originalName)}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                      </svg>
                      <span>{file.originalName}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {userRole === 'STUDENT' && (
          <div className="task-sidebar">
            <div className="sidebar-card">
              <div className="sidebar-header">
                <h3>Мое решение</h3>
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
                              {lateSubmission && (
                                <span className="late-submission-text"> • После срока</span>
                              )}
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
