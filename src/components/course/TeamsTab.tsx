import React, { useEffect, useMemo, useState } from 'react';
import './TeamsTab.css';
import { categoryService, membersService, teamsService } from '../../api/services';
import {
  CourseCategoryDto,
  CourseRole,
  CourseTeamDto,
  CreateCourseTeamRequest,
  MemberDto,
} from '../../types/api';
import { useTeamGrade } from './TeamGrade/hooks/useTeamGrade';
import GradeDialog from './TeamGrade/GradeDialog';
import CaptainGradeDialog from './TeamGrade/CaptainGradeDialog';
import { TeamGradeDistributionMode } from '../../types/TeamGrade';

interface TeamsTabProps {
  courseId: string;
  userRole: CourseRole;
  postId?: string;
}

const getHttpStatus = (err: any): number | null => {
  const message = String(err?.message || '');
  const match = message.match(/\b(400|403|404|409)\b/);
  return match ? Number(match[1]) : null;
};

const getTeamListError = (status: number | null) => {
  if (status === 403) {
    return 'Просмотр команд доступен только участникам курса';
  }

  if (status === 404) {
    return 'Курс не найден';
  }

  return 'Не удалось загрузить список команд';
};

const getCreateTeamError = (status: number | null, fallback: string) => {
  if (status === 403) {
    return 'Создавать команды может только преподаватель курса';
  }

  if (status === 404) {
    return 'Курс не найден';
  }

  if (status === 409) {
    return fallback || 'Команда с таким именем уже существует или один из студентов уже состоит в другой команде';
  }

  if (status === 400) {
    return fallback || 'Не удалось создать команду. Проверьте состав и выбранные категории';
  }

  return fallback || 'Не удалось создать команду';
};

const formatLimit = (maxSize: number | null) => {
  return maxSize === null ? 'без лимита' : `${maxSize}`;
};

const translateTeamGradeDistributionMode: Record<TeamGradeDistributionMode, string> = {
  MANUAL: 'ручное',
  AUTO_EQUAL: 'автоматическое',
  CAPTAIN_MANUAL: 'капитан вручную',
  TEAM_VOTE: 'голосование команды',
};

export default function TeamsTab({ courseId, userRole, postId }: TeamsTabProps) {

  const { state, functions } = useTeamGrade(courseId, postId);

  const [teams, setTeams] = useState<CourseTeamDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [members, setMembers] = useState<MemberDto[]>([]);
  const [categories, setCategories] = useState<CourseCategoryDto[]>([]);
  const [form, setForm] = useState<CreateCourseTeamRequest>({
    name: '',
    memberIds: [],
    categoryIds: [],
  });

  useEffect(() => {
    loadTeams();
  }, [courseId]);

  useEffect(() => {
    if (userRole === 'TEACHER') {
      loadFormData();
    }
  }, [courseId, userRole]);

  const studentMembers = useMemo(
    () => members.filter((member) => member.role === 'STUDENT'),
    [members]
  );

  const loadTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await teamsService.listCourseTeams(courseId);
      setTeams(data);
    } catch (err: any) {
      console.error('Failed to load course teams:', err);
      setTeams([]);
      setError(getTeamListError(getHttpStatus(err)));
    } finally {
      setLoading(false);
    }
  };

  const loadFormData = async () => {
    try {
      const [membersResponse, categoriesResponse] = await Promise.all([
        membersService.listMembers(courseId),
        categoryService.listCategories(courseId),
      ]);

      setMembers(membersResponse.content);
      setCategories(categoriesResponse);
    } catch (err: any) {
      console.error('Failed to load team form data:', err);
      setMembers([]);
      setCategories([]);
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      memberIds: [],
      categoryIds: [],
    });
    setCreateError(null);
  };

  const toggleMember = (memberId: string) => {
    setForm((prev) => ({
      ...prev,
      memberIds: prev.memberIds?.includes(memberId)
        ? prev.memberIds.filter((id) => id !== memberId)
        : [...(prev.memberIds || []), memberId],
    }));
  };

  const toggleCategory = (categoryId: string) => {
    setForm((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds?.includes(categoryId)
        ? prev.categoryIds.filter((id) => id !== categoryId)
        : [...(prev.categoryIds || []), categoryId],
    }));
  };

  const handleCreateTeam = async () => {
    if (!form.name.trim()) {
      setCreateError('Введите название команды');
      return;
    }

    try {
      setCreating(true);
      setCreateError(null);

      const createdTeam = await teamsService.createCourseTeam(courseId, {
        name: form.name.trim(),
        memberIds: form.memberIds || [],
        categoryIds: form.categoryIds || [],
      });

      setTeams((prev) => [...prev, createdTeam]);
      setShowCreateTeam(false);
      resetForm();
    } catch (err: any) {
      console.error('Failed to create team:', err);
      setCreateError(getCreateTeamError(getHttpStatus(err), err.message || ''));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="teams-tab">
      <div className="teams-section">
        <div className="section-header">
          <h2>Команды курса</h2>
          {userRole === 'TEACHER' && (
            <button
              className="create-team-button"
              onClick={() => {
                setShowCreateTeam((prev) => !prev);
                setCreateError(null);
              }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
              Создать команду
            </button>
          )}
        </div>

        {userRole === 'TEACHER' && showCreateTeam && (
          <div className="create-team-form">
            <h3>Новая команда</h3>

            <div className="form-group">
              <label htmlFor="team-name">Название команды</label>
              <input
                id="team-name"
                type="text"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Например, Team A"
              />
            </div>

            <div className="form-group">
              <label>Студенты</label>
              <div className="selection-list">
                {studentMembers.length === 0 ? (
                  <div className="selection-empty">Нет доступных студентов</div>
                ) : (
                  studentMembers.map((member) => (
                    <label key={member.user.id} className="selection-item">
                      <input
                        type="checkbox"
                        checked={form.memberIds?.includes(member.user.id) || false}
                        onChange={() => toggleMember(member.user.id)}
                      />
                      <span>{member.user.displayName}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Категории</label>
              <div className="selection-list">
                {categories.length === 0 ? (
                  <div className="selection-empty">Категорий пока нет</div>
                ) : (
                  categories.map((category) => (
                    <label key={category.id} className="selection-item">
                      <input
                        type="checkbox"
                        checked={form.categoryIds?.includes(category.id) || false}
                        onChange={() => toggleCategory(category.id)}
                      />
                      <span>{category.title}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {createError && <div className="form-error">{createError}</div>}

            <div className="form-actions">
              <button
                className="cancel-button"
                onClick={() => {
                  setShowCreateTeam(false);
                  resetForm();
                }}
                disabled={creating}
              >
                Отмена
              </button>
              <button
                className="submit-button"
                onClick={handleCreateTeam}
                disabled={creating}
              >
                {creating ? 'Создание...' : 'Создать'}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading-state">Загрузка команд...</div>
        ) : error ? (
          <div className="teams-error-state">
            <span>{error}</span>
            <button className="retry-button" onClick={loadTeams}>Повторить</button>
          </div>
        ) : teams.length === 0 ? (
          <div className="empty-state">
            <p>Команд пока нет</p>
          </div>
        ) : (
          <div className="teams-list">
            {teams.map((team) => (
              <div key={team.id} className="course-team-card">
                <div className="course-team-header">
                  <div>
                    <h3>{team.name}</h3>
                    <div className="course-team-meta">
                      {state.grade && state.distribution ? (
                        <div>
                          <span>Оценка команды: {state.grade.grade}</span>
                          <button
                            className="submit-button"
                            onClick={() => functions.handleOpenGradeModal(team)}
                          >
                            Изменить
                          </button>
                          <span>Режим распределения оценки: {translateTeamGradeDistributionMode[state.distribution.distributionMode]}</span>
                        </div>
                      ) : (
                        <div>
                          <button
                            className="submit-button"
                            onClick={() => functions.handleOpenGradeModal(team)}
                          >
                            Оценить
                          </button>
                        </div>
                      )}
                      <GradeDialog
                        showTeamGradeModal={state.showTeamGradeModal}
                        selectedTeam={state.selectedTeam}
                        setShowTeamGradeModal={functions.setShowTeamGradeModal}
                        gradeValue={state.gradeValue}
                        setGradeValue={functions.setGradeValue}
                        commentValue={state.gradeComment}
                        setCommentValue={functions.setGradeComment}
                        handleTeamGradeSolution={functions.handleTeamGradeSolution}
                        distributionMode={state.distributionMode}
                        setDistributionMode={functions.setDistributionMode}
                        team={team} />
                      <span>Участников: {team.membersCount}</span>
                      <span>Лимит: {formatLimit(team.maxSize)}</span>
                    </div>
                  </div>
                  <div className="course-team-badges">
                    {team.isFull && <span className="course-team-badge full">Команда заполнена</span>}
                    {team.selfEnrollmentEnabled && (
                      <span className="course-team-badge open">Самозапись включена</span>
                    )}
                  </div>
                </div>

                {team.categories.length > 0 && (
                  <div className="course-team-block">
                    <div className="block-label">Категории</div>
                    <div className="chip-list">
                      {team.categories.map((category) => (
                        <span key={category.id} className="team-chip">{category.title}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="course-team-block">
                  <div className="block-label">Участники</div>
                  {team.members.length === 0 ? (
                    <div className="members-empty">Пока нет участников</div>
                  ) : (
                    <div className="team-members-list">
                      {team.members.map((member) => {
                        const isCaptain = state.captains.some((c) => c.userId === member.user.id);
                        const studentGrade = state.distribution?.students.find(
                          (s) => s.student.id === member.user.id
                        );
                        return (
                          <div key={member.user.id} className="team-member-item">
                            <span className="team-member-name">{member.user.displayName}</span>
                            {state.distribution?.distributionMode === 'CAPTAIN_MANUAL' && isCaptain && (
                              <div>
                                <button
                                  className="submit-button"
                                  onClick={() => functions.handleOpenCaptainGradeModal()}
                                >
                                  Распределить оценки
                                </button>
                              </div>
                            )}
                            <CaptainGradeDialog
                              showCaptainGradeModal={state.showCaptainGradeModal}
                              setShowCaptainGradeModal={functions.setShowCaptainGradeModal}
                              handleCaptainGradeDistribution={functions.handleCaptainGradeDistribution}
                              members={members}
                              setCaptainDistribution={functions.setCaptainDistribution}
                              captainDistribution={state.captainDistribution}
                              handleGradeChange={functions.handleGradeChange}
                            />
                            {studentGrade && (
                              <span className="team-member-name">Оценка: {studentGrade.grade}</span>
                            )}
                            {member.category && (
                              <span className="team-member-category">{member.category.title}</span>
                            )}
                          </div>);
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
