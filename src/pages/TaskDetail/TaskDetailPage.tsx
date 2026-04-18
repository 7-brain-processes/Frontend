import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTaskDetailPage } from './hooks/useTaskDetailPage';
import { coursesService, postsService, teamGradesService, teamsService } from '../../api/services';
import { CourseRole, CourseTeamAvailabilityDto, CourseTeamDto } from '../../types/api';
import { useTeamGrade } from '../../components/course/TeamGrade/hooks/useTeamGrade';
import GradeDialog from '../../components/course/TeamGrade/GradeDialog';
import CaptainGradeDialog from '../../components/course/TeamGrade/CaptainGradeDialog';
import './TaskDetailPage.css';

const translateTeamFormationMode = {
  FREE: 'самостоятельное',
  DRAFT: 'драфт',
  CAPTAIN_SELECTION: 'драфт',
  RANDOM_SHUFFLE: 'рандомное'
} as const;

const TaskDetailPage = () => {
  const { courseId, taskId } = useParams<{ courseId: string; taskId: string }>();
  const [userRole, setUserRole] = useState<CourseRole>('STUDENT');
  const [loadingRole, setLoadingRole] = useState(true);
  const [courseTeams, setCourseTeams] = useState<CourseTeamDto[]>([]);
  const [availableTaskTeamIds, setAvailableTaskTeamIds] = useState<Set<string>>(new Set());
  const [isAvailableTeamsLoaded, setIsAvailableTeamsLoaded] = useState(true);
  const [teamGradesByTeamId, setTeamGradesByTeamId] = useState<Record<string, number>>({});
  const [teacherFreeTeamName, setTeacherFreeTeamName] = useState('');
  const [teacherFreeTeamMaxSize, setTeacherFreeTeamMaxSize] = useState<number>(4);
  const [teacherFreeCreateLoading, setTeacherFreeCreateLoading] = useState(false);
  const [teacherFreeCreateError, setTeacherFreeCreateError] = useState<string | null>(null);
  const [teacherFreeCreateSuccess, setTeacherFreeCreateSuccess] = useState<string | null>(null);
  const teamGrade = useTeamGrade(courseId, taskId);

  const loadTeamsForTeacher = React.useCallback(async () => {
    console.log('[TaskDetail] useEffect: loading teams', {
      courseId,
      taskId,
      userRole,
      shouldLoad: !!courseId && !!taskId && userRole === 'TEACHER',
    });

    if (!courseId || !taskId || userRole !== 'TEACHER') {
      console.log('[TaskDetail] Skipping team load: missing params or not teacher');
      return;
    }

    console.log('[TaskDetail] Loading teams...');

    const [fullTeamsResult, availableTeamsResult] = await Promise.allSettled([
      teamsService.listCourseTeams(courseId),
      postsService.listAvailableTeams(courseId, taskId),
    ]);

    if (fullTeamsResult.status === 'fulfilled') {
      setCourseTeams(fullTeamsResult.value);
    } else {
      console.error('Failed to load course teams for teacher grading:', fullTeamsResult.reason);
      setCourseTeams([]);
    }

    if (availableTeamsResult.status === 'fulfilled') {
      setAvailableTaskTeamIds(new Set(availableTeamsResult.value.map((t) => t.id)));
      setIsAvailableTeamsLoaded(true);
    } else {
      console.error('Failed to load task available teams, fallback to all course teams:', availableTeamsResult.reason);
      setAvailableTaskTeamIds(new Set());
      setIsAvailableTeamsLoaded(false);
    }

    console.log('[TaskDetail] Teams loaded:', {
      fullTeamsCount: fullTeamsResult.status === 'fulfilled' ? fullTeamsResult.value.length : 0,
      availableTeamsCount: availableTeamsResult.status === 'fulfilled' ? availableTeamsResult.value.length : 0,
      isAvailableTeamsLoaded: availableTeamsResult.status === 'fulfilled',
    });
  }, [courseId, taskId, userRole]);

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

  useEffect(() => {
    loadTeamsForTeacher();
  }, [loadTeamsForTeacher]);

  useEffect(() => {
    const loadTeamGradesForTeacher = async () => {
      if (!courseId || !taskId || userRole !== 'TEACHER' || courseTeams.length === 0) {
        setTeamGradesByTeamId({});
        return;
      }

      const teamsForTask = isAvailableTeamsLoaded
        ? courseTeams.filter((team) => availableTaskTeamIds.has(team.id))
        : courseTeams;

      const entries = await Promise.all(
        teamsForTask.map(async (team) => {
          try {
            const teamGradeData = await teamGradesService.getGrade(courseId, taskId, team.id);
            return [team.id, teamGradeData.grade] as const;
          } catch {
            return null;
          }
        })
      );

      const nextTeamGrades: Record<string, number> = {};
      entries.forEach((entry) => {
        if (entry) {
          nextTeamGrades[entry[0]] = entry[1];
        }
      });

      setTeamGradesByTeamId(nextTeamGrades);
    };

    loadTeamGradesForTeacher();
  }, [
    courseId,
    taskId,
    userRole,
    courseTeams,
    availableTaskTeamIds,
    isAvailableTeamsLoaded,
    teamGrade.state.grade?.updatedAt,
  ]);

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

  const votingMembers = state.currentTeam?.members?.map((member) => ({
    id: member.user.id,
    displayName: member.user.displayName,
    username: member.user.username,
  })) || (state.isCurrentUserCaptain
    ? state.captainTeam.map((member) => ({
        id: member.userId,
        displayName: member.displayName,
        username: member.username,
      }))
    : []);

  const captainDialogMembers = state.captainTeam.length > 0
    ? state.captainTeam.map((member) => ({
        user: {
          id: member.userId,
          displayName: member.displayName,
        },
      }))
    : (state.currentTeam?.members || []).map((member) => ({
        user: {
          id: member.user.id,
          displayName: member.user.displayName,
        },
      }));

  const gradeVoteTotal = state.gradeVoteForm.reduce((sum, item) => sum + item.grade, 0);

  const findVotingMember = (studentId: string) => {
    return votingMembers.find((member) => member.id === studentId);
  };

  const isTeamEffectivelyFull = (team: CourseTeamAvailabilityDto) => {
    if (team.maxSize === null) {
      return team.isFull;
    }

    return team.isFull || team.currentMembers >= team.maxSize;
  };

  const isSelfEnrollmentDisabled = (team: CourseTeamAvailabilityDto) => {
    return team.selfEnrollmentEnabled === false;
  };

  const getUnavailableReason = (team: CourseTeamAvailabilityDto): string | null => {
    if (team.isStudentMember) {
      return 'Вы уже состоите в этой команде';
    }

    if (state.currentTeam && !team.isStudentMember) {
      return 'Сначала выйдите из текущей команды';
    }

    if (isSelfEnrollmentDisabled(team)) {
      return 'Самозапись в эту команду отключена';
    }

    if (isTeamEffectivelyFull(team)) {
      return 'Команда заполнена';
    }

    return null;
  };

  const availableTeamsForJoin = state.availableTeams.filter((team) => !getUnavailableReason(team));
  const unavailableTeams = state.availableTeams.filter((team) => !!getUnavailableReason(team));

  const findTeamByStudentId = (studentId: string) => {
    return courseTeams.find((team) => {
      const matchesStudent = team.members.some((member) => member.user.id === studentId);
      if (!matchesStudent) {
        return false;
      }

      if (!isAvailableTeamsLoaded) {
        return true;
      }

      return availableTaskTeamIds.has(team.id);
    });
  };

  const teacherTaskTeams = (isAvailableTeamsLoaded
    ? courseTeams.filter((team) => availableTaskTeamIds.has(team.id))
    : courseTeams).filter((team) => team.selfEnrollmentEnabled);

  const handleOpenTeamGradeModal = (studentId: string) => {
    console.log('[TaskDetail] Ищем команду для studentId:', {
      studentId,
      courseTeamsCount: courseTeams.length,
      availableTaskTeamIds: Array.from(availableTaskTeamIds),
      courseTeamsIds: courseTeams.map((t) => ({
        id: t.id,
        members: t.members.map((m) => m.user.id),
      })),
    });

    console.log('[TaskDetail] Component state at click:', {
      courseId,
      taskId,
      userRole,
      isAvailableTeamsLoaded,
    });

    const team = findTeamByStudentId(studentId);

    if (!team) {
      let errorMsg = 'Не удалось определить команду этого участника для оценки в этом задании.\n\n';
      
      if (courseTeams.length === 0) {
        errorMsg += 'Причина: Команды не загружены. Попробуйте перезагрузить страницу.';
      } else if (isAvailableTeamsLoaded && availableTaskTeamIds.size === 0) {
        errorMsg += 'Причина: Для этого задания нет доступных команд.';
      } else {
        const allTeamsHaveStudent = courseTeams.some(t => t.members.some(m => m.user.id === studentId));
        if (allTeamsHaveStudent) {
          if (!isAvailableTeamsLoaded) {
            errorMsg += 'Причина: Не удалось загрузить список команд задания, и команда студента не найдена даже среди всех команд курса.';
          } else {
            errorMsg += 'Причина: Студент в команде, но эта команда не привязана к этому заданию.';
          }
        } else {
          errorMsg += 'Причина: Студент не состоит ни в одной команде для этого задания.';
        }
      }

      console.error('[TaskDetail] Error finding team:', errorMsg);
      alert(errorMsg);
      return;
    }

    teamGrade.functions.handleOpenGradeModal(team);
  };

  const handleCreateTeacherFreeTeam = async () => {
    if (!courseId || !taskId) return;

    const normalizedName = teacherFreeTeamName.trim();
    if (!normalizedName) {
      setTeacherFreeCreateError('Введите название команды');
      return;
    }

    if (!Number.isFinite(teacherFreeTeamMaxSize) || teacherFreeTeamMaxSize < 1) {
      setTeacherFreeCreateError('Максимальный размер команды должен быть больше 0');
      return;
    }

    try {
      setTeacherFreeCreateLoading(true);
      setTeacherFreeCreateError(null);
      setTeacherFreeCreateSuccess(null);

      await postsService.createAssignmentTeam(courseId, taskId, {
        name: normalizedName,
        maxSize: teacherFreeTeamMaxSize,
        selfEnrollmentEnabled: true,
        memberIds: [],
        categoryIds: [],
      });

      setTeacherFreeCreateSuccess(`Команда ${normalizedName} успешно создана`);
      setTeacherFreeTeamName('');
      await loadTeamsForTeacher();
    } catch (err: any) {
      console.error('Failed to create assignment team:', err);
      setTeacherFreeCreateError(err.message || 'Не удалось создать команду задания');
    } finally {
      setTeacherFreeCreateLoading(false);
    }
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
                          {(state.currentTeam.members || []).map((member) => (
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
                  ) : availableTeamsForJoin.length === 0 ? (
                    <div className="teams-state">Доступных команд пока нет</div>
                  ) : (
                    <div className="teams-list">
                      {availableTeamsForJoin.map((team) => {
                        return (
                          <div
                            key={team.id}
                            className="team-card"
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

                              <div className="team-badges" />
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
                                disabled={state.actionTeamId === team.id}
                              >
                                {state.actionTeamId === team.id ? 'Вступление...' : 'Вступить'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="current-team-header">
                    <h4>Недоступные команды</h4>
                  </div>

                  {state.teamsLoading ? (
                    <div className="teams-state">Загрузка недоступных команд...</div>
                  ) : unavailableTeams.length === 0 ? (
                    <div className="teams-state">Недоступных команд нет</div>
                  ) : (
                    <div className="teams-list">
                      {unavailableTeams.map((team) => {
                        const reason = getUnavailableReason(team);

                        return (
                          <div
                            key={team.id}
                            className={`team-card team-card-unavailable ${team.isStudentMember ? 'team-card-current' : ''}`}
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
                                <span className="team-badge team-badge-locked">Недоступна</span>
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

                            {reason && (
                              <div className="team-unavailable-reason">{reason}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {userRole === 'STUDENT' && state.task.teamFormationMode === 'RANDOM_SHUFFLE' && (
              <div className="task-description teams-section">
                <div className="teams-section-header">
                  <h3>Моя команда</h3>
                  <p>Команда формируется автоматически преподавателем. Самостоятельный выбор недоступен.</p>
                </div>

                {state.currentTeamLoading ? (
                  <div className="teams-state">Загрузка текущей команды...</div>
                ) : state.currentTeamError ? (
                  <div className="teams-state teams-state-error">
                    <span>{state.currentTeamError}</span>
                  </div>
                ) : !state.currentTeam ? (
                  <div className="teams-state">Вы пока не распределены в команду</div>
                ) : (
                  <div className="team-card team-card-current">
                    <div className="team-card-header">
                      <div>
                        <h4 className="team-name">{state.currentTeam.teamName}</h4>
                        <div className="team-capacity">
                          Участники: {formatTeamCapacity(state.currentTeam.membersCount, state.currentTeam.maxSize)}
                        </div>
                        <div className="team-joined-at">
                          Добавлены: {formatJoinedAt(state.currentTeam.joinedAt)}
                        </div>
                      </div>
                    </div>

                    <div className="team-members-section">
                      <span className="team-categories-label">Участники команды:</span>
                      <div className="team-members-list">
                        {(state.currentTeam.members || []).map((member) => (
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
            )}

            {userRole === 'TEACHER' && state.task.teamFormationMode === 'FREE' && (
              <div className="task-description teams-section">
                <div className="teams-section-header">
                  <h3>Команды задания</h3>
                  <p>Создавайте команды задания для самостоятельного распределения студентов.</p>
                </div>

                {teacherFreeCreateSuccess && (
                  <div className="teams-state teams-state-success">{teacherFreeCreateSuccess}</div>
                )}

                {teacherFreeCreateError && (
                  <div className="teams-state teams-state-error">
                    <span>{teacherFreeCreateError}</span>
                  </div>
                )}

                <div className="teacher-free-create-form">
                  <label className="teacher-free-field">
                    <span>Название команды</span>
                    <input
                      type="text"
                      value={teacherFreeTeamName}
                      onChange={(e) => setTeacherFreeTeamName(e.target.value)}
                      placeholder="Например: Team A"
                    />
                  </label>

                  <label className="teacher-free-field teacher-free-field-size">
                    <span>Лимит участников</span>
                    <input
                      type="number"
                      min="1"
                      value={teacherFreeTeamMaxSize}
                      onChange={(e) => setTeacherFreeTeamMaxSize(Number(e.target.value))}
                    />
                  </label>

                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleCreateTeacherFreeTeam}
                    disabled={teacherFreeCreateLoading}
                  >
                    {teacherFreeCreateLoading ? 'Создание...' : 'Создать команду'}
                  </button>
                </div>

                {teacherTaskTeams.length === 0 ? (
                  <div className="teams-state">Команды задания пока не созданы</div>
                ) : (
                  <div className="teams-list">
                    {teacherTaskTeams.map((team) => (
                      <div key={team.id} className="team-card">
                        <div className="team-card-header">
                          <div>
                            <h4 className="team-name">{team.name}</h4>
                            <div className="team-capacity">
                              Участники: {formatTeamCapacity(team.membersCount, team.maxSize)}
                            </div>
                            <div className="team-created-at">
                              Создана: {formatTeamCreatedAt(team.createdAt)}
                            </div>
                          </div>

                          <div className="team-badges">
                            <span className="team-badge team-badge-current">
                              Самозапись: {team.selfEnrollmentEnabled ? 'включена' : 'выключена'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                            <strong>{state.autoFormationResult.formedTeams}</strong>
                            <span>Команд</span>
                          </div>
                          <div className="auto-summary-item">
                            <strong>{state.autoFormationResult.assignedStudents}</strong>
                            <span>Распределено</span>
                          </div>
                          <div className="auto-summary-item">
                            <strong>{state.autoFormationResult.unassignedStudents}</strong>
                            <span>Нераспределено</span>
                          </div>
                          {state.autoFormationResult.generatedAt && (
                            <div className="auto-generated-at">
                              Сформировано: {formatTeamCreatedAt(state.autoFormationResult.generatedAt)}
                            </div>
                          )}
                        </div>
                      )}

                      {state.autoFormationResult?.teams && state.autoFormationResult.teams.length > 0 && (
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
                      )}
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

                {!state.isCurrentUserCaptain && userRole === 'STUDENT' && (state.currentTeamLoading || state.currentTeamError || state.currentTeam) && (
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
                    ) : state.currentTeam ? (
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
                        </div>

                        <div className="team-members-section">
                          <span className="team-categories-label">Участники команды:</span>
                          <div className="team-members-list">
                            {(state.currentTeam.members || []).map((member) => (
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
                    ) : null}
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
                        ) : state.captainTeam.length === 0 ? (
                          <div className="teams-state">Пока команда не сформирована.</div>
                        ) : (
                          <div className="team-card team-card-current">
                            <div className="team-members-section">
                              <span className="team-categories-label">Участники команды:</span>
                              <div className="team-members-list">
                                {state.captainTeam.map((member) => (
                                  <div key={member.userId} className="team-member-row">
                                    <span className="team-member-name">{member.displayName}</span>
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
                          const isPending = invitation.status?.toUpperCase() === 'PENDING';
                          const actionInProgress = state.studentInvitationActionId === invitation.id;
                          const teamName = invitation.team?.teamName || 'Команда капитана';
                          const captainName = invitation.captain?.displayName || invitation.captain?.username || 'Капитан';

                          return (
                            <div key={invitation.id} className="student-invitation-card">
                              <div className="student-invitation-main">
                                <div className="student-invitation-title">
                                  Команда: <strong>{teamName}</strong>
                                </div>
                                <div className="student-invitation-meta">
                                  Капитан: {captainName}
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

            {userRole === 'STUDENT' && (state.myTeamGradeLoading || state.myTeamGrade || state.myTeamGradeError) && (
              <div className="task-description">
                <h3>Оценка команды</h3>
                {state.myTeamGradeLoading ? (
                  <div className="teams-state">Загрузка оценки команды...</div>
                ) : state.myTeamGradeError ? (
                  <div className="teams-state teams-state-error">{state.myTeamGradeError}</div>
                ) : state.myTeamGrade ? (
                  <div className="grade-vote-content">
                    <div className="grade-vote-summary">
                      <div className="auto-summary-item">
                        <strong>{state.myTeamGrade.teamGrade ?? 'Пока не выставлена'}</strong>
                        <span>Оценка команды</span>
                      </div>
                      <div className="auto-summary-item">
                        <strong>{state.myTeamGrade.myGrade ?? 'Пока не определена'}</strong>
                        <span>Моя итоговая оценка</span>
                      </div>
                    </div>

                    {state.myTeamGrade.finalDistribution && state.myTeamGrade.finalDistribution.length > 0 && (
                      <div className="grade-vote-final">
                        <h4>Итоговое распределение</h4>
                        <div className="grade-vote-final-list">
                          {state.myTeamGrade.finalDistribution.map((item) => (
                            <div key={item.student.id} className="grade-vote-final-row">
                              <span>{item.student.displayName}</span>
                              <strong>{item.grade ?? '—'}</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}

                {state.isCurrentUserCaptain && state.myTeamGrade?.distributionMode === 'CAPTAIN_MANUAL' && captainDialogMembers.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={teamGrade.functions.handleOpenCaptainGradeModal}
                    >
                      Распределить оценки команды
                    </button>
                  </div>
                )}
              </div>
            )}

            {userRole === 'STUDENT' && state.myTeamGrade?.distributionMode === 'TEAM_VOTE' && (state.gradeVoteLoading || state.gradeVoteStatus || state.gradeVoteError) && (
              <div className="task-description grade-vote-section">
                <div className="captains-header">
                  <div>
                    <h3>Распределение оценки</h3>
                    <p>Голосование команды по распределению общей оценки между участниками.</p>
                  </div>
                  <button
                    type="button"
                    className="btn-secondary btn-small"
                    onClick={() => functions.retryLoadGradeVote()}
                    disabled={state.gradeVoteLoading || state.gradeVoteSubmitting}
                  >
                    Обновить
                  </button>
                </div>

                {state.gradeVoteSuccess && (
                  <div className="teams-state teams-state-success">{state.gradeVoteSuccess}</div>
                )}

                {state.gradeVoteError && (
                  <div className="teams-state teams-state-error">
                    <span>{state.gradeVoteError}</span>
                  </div>
                )}

                {state.gradeVoteLoading ? (
                  <div className="teams-state">Загрузка голосования...</div>
                ) : state.gradeVoteStatus ? (
                  <div className="grade-vote-content">
                    <div className="grade-vote-summary">
                      <div className="auto-summary-item">
                        <strong>{state.gradeVoteStatus.teamGrade}</strong>
                        <span>Общая оценка команды</span>
                      </div>
                      <div className="auto-summary-item">
                        <strong>{state.gradeVoteStatus.finalized ? 'Да' : 'Нет'}</strong>
                        <span>Голосование завершено</span>
                      </div>
                      <div className="auto-summary-item">
                        <strong>{state.gradeVoteStatus.voters.filter((voter) => voter.hasVoted).length}</strong>
                        <span>Проголосовали</span>
                      </div>
                    </div>

                    <div className="grade-vote-mode">Распределение оценки: голосование команды</div>

                    <div className="grade-vote-status-list">
                      {state.gradeVoteStatus.voters.map((voter) => (
                        <div key={voter.user.id} className="grade-vote-status-row">
                          <span>{voter.user.displayName}</span>
                          <span className={`team-badge ${voter.hasVoted ? 'team-badge-current' : 'team-badge-locked'}`}>
                            {voter.hasVoted ? 'Проголосовал' : 'Еще не голосовал'}
                          </span>
                        </div>
                      ))}
                    </div>

                    {state.gradeVoteStatus.myVote && (
                      <div className="teams-state teams-state-success">Ваш голос уже отправлен.</div>
                    )}

                    {!state.gradeVoteStatus.finalized && !state.gradeVoteStatus.myVote && votingMembers.length > 0 && (
                      <div className="grade-vote-form">
                        <div className="grade-vote-form-header">
                          <h4>Ваш голос</h4>
                          <div className={`grade-vote-total ${gradeVoteTotal === state.gradeVoteStatus.teamGrade ? 'grade-vote-total-valid' : 'grade-vote-total-invalid'}`}>
                            Сумма: {gradeVoteTotal} / {state.gradeVoteStatus.teamGrade}
                          </div>
                        </div>

                        <div className="grade-vote-inputs">
                          {state.gradeVoteForm.map((entry) => {
                            const member = findVotingMember(entry.studentId);

                            return (
                              <label key={entry.studentId} className="grade-vote-input-row">
                                <div className="grade-vote-student">
                                  <strong>{member?.displayName || entry.studentId}</strong>
                                  {member?.username && <span>@{member.username}</span>}
                                </div>
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={entry.grade}
                                  onChange={(e) => functions.handleGradeVoteFieldChange(entry.studentId, Number(e.target.value))}
                                />
                              </label>
                            );
                          })}
                        </div>

                        <button
                          type="button"
                          className="btn-primary"
                          onClick={functions.handleSubmitGradeVote}
                          disabled={state.gradeVoteSubmitting}
                        >
                          {state.gradeVoteSubmitting ? 'Отправка...' : 'Отправить голос'}
                        </button>
                      </div>
                    )}

                    {state.gradeVoteStatus.finalized && state.gradeVoteStatus.finalDistribution && (
                      <div className="grade-vote-final">
                        <h4>Итоговое распределение</h4>
                        <div className="grade-vote-final-list">
                          {state.gradeVoteStatus.finalDistribution.map((item) => (
                            <div key={item.student.id} className="grade-vote-final-row">
                              <span>{item.student.displayName}</span>
                              <strong>{item.grade}</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
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
                  const solutionTeam = findTeamByStudentId(solution.student.id);
                  const solutionTeamGrade = solutionTeam ? teamGradesByTeamId[solutionTeam.id] : undefined;

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

                      <div className="solution-meta solution-meta-stacked">
                        <div className="solution-meta-item">
                          <button
                            className="btn-secondary btn-edit-grade"
                            onClick={() => functions.handleOpenGradeModal(solution)}
                          >
                            Оценить решение студента
                          </button>
                          <span className="grade-value solution-meta-grade-text">
                            Оценка: {solution.grade !== null ? solution.grade : 'не выставлена'}
                          </span>
                        </div>

                        <div className="solution-meta-item">
                          <button
                            className="btn-secondary btn-edit-grade"
                            onClick={() => handleOpenTeamGradeModal(solution.student.id)}
                          >
                            Оценить команду
                          </button>
                          <span className="grade-value solution-meta-grade-text">
                            Оценка команды: {solutionTeamGrade !== undefined ? solutionTeamGrade : 'не выставлена'}
                          </span>
                        </div>
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
              <h2>Оценить решение студента</h2>
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
              <div className="form-group">
                <label htmlFor="grade-comment-input">Комментарий (необязательно)</label>
                <textarea
                  id="grade-comment-input"
                  value={state.gradeComment}
                  onChange={(e) => functions.setGradeComment(e.target.value)}
                  maxLength={5000}
                  rows={4}
                  placeholder="Например: Хорошая работа"
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
                Сохранить оценку решения
              </button>
            </div>
          </div>
        </div>
      )}

      <GradeDialog
        showTeamGradeModal={teamGrade.state.showTeamGradeModal}
        selectedTeam={teamGrade.state.selectedTeam}
        setShowTeamGradeModal={teamGrade.functions.setShowTeamGradeModal}
        gradeValue={teamGrade.state.gradeValue}
        setGradeValue={teamGrade.functions.setGradeValue}
        commentValue={teamGrade.state.gradeComment}
        setCommentValue={teamGrade.functions.setGradeComment}
        handleTeamGradeSolution={teamGrade.functions.handleTeamGradeSolution}
        distributionMode={teamGrade.state.distributionMode}
        setDistributionMode={teamGrade.functions.setDistributionMode}
        team={teamGrade.state.selectedTeam || ({ id: '', name: 'Команда', createdAt: '', membersCount: 0, members: [], maxSize: null, selfEnrollmentEnabled: false, isFull: false, categories: [], categoryId: null, categoryTitle: null } as CourseTeamDto)}
        teamFormationMode={state.task.teamFormationMode}
      />

      <CaptainGradeDialog
        showCaptainGradeModal={teamGrade.state.showCaptainGradeModal}
        setShowCaptainGradeModal={teamGrade.functions.setShowCaptainGradeModal}
        handleCaptainGradeDistribution={teamGrade.functions.handleCaptainGradeDistribution}
        members={captainDialogMembers}
        setCaptainDistribution={teamGrade.functions.setCaptainDistribution}
        captainDistribution={teamGrade.state.captainDistribution}
        handleGradeChange={teamGrade.functions.handleGradeChange}
      />
    </div>
  );
};

export default TaskDetailPage;
