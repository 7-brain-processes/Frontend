import React, { useState, useEffect } from 'react';
import './PeopleTab.css';
import { MemberDto, InviteDto, CourseRole } from '../../types/api';
import { membersService, invitesService, coursesService } from '../../api/services';

interface PeopleTabProps {
  courseId: string;
  userRole: CourseRole;
}

type MemberFilter = 'ALL' | 'TEACHER' | 'STUDENT';

export const loadMembersFunc = async (setLoading: React.Dispatch<React.SetStateAction<boolean>>, courseId: string, setMembers: React.Dispatch<React.SetStateAction<MemberDto[]>>) => {
  try {
    setLoading(true);
    const response = await membersService.listMembers(courseId);
    setMembers(response.content);
  } catch (err: any) {
    console.error('Failed to load members:', err);
    setMembers([]);
  } finally {
    setLoading(false);
  }
};

export const handleLeaveCourseFunc = async (courseId: string) => {
  if (!window.confirm('Вы уверены, что хотите покинуть курс?')) {
    return;
  }

  try {
    await coursesService.leaveCourse(courseId);
    window.location.href = '/courses';
  } catch (err: any) {
    console.error('Failed to leave course:', err);
    alert(err.message || 'Ошибка выхода из курса');
  }
};

export default function PeopleTab({ courseId, userRole }: PeopleTabProps) {
  const [members, setMembers] = useState<MemberDto[]>([]);
  const [invites, setInvites] = useState<InviteDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<MemberFilter>('ALL');
  const [showCreateInvite, setShowCreateInvite] = useState(false);
  const [inviteRole, setInviteRole] = useState<CourseRole>('STUDENT');
  const [inviteMaxUses, setInviteMaxUses] = useState<number>(1);
  const [inviteExpiresIn, setInviteExpiresIn] = useState<number>(7);

  useEffect(() => {
    loadMembers();
    if (userRole === 'TEACHER') {
      loadInvites();
    }
  }, [courseId, userRole]);

  const loadMembers = () => {
    loadMembersFunc(setLoading, courseId, setMembers);
  };

  const loadInvites = async () => {
    try {
      const data = await invitesService.listInvites(courseId);
      setInvites(data);
    } catch (err: any) {
      console.error('Failed to load invites, using empty list:', err);
      setInvites([]);
    }
  };

  const handleCreateInvite = async () => {
    try {
      const newInvite = await invitesService.createInvite(courseId, {
        role: inviteRole,
        maxUses: inviteMaxUses,
        expiresInDays: inviteExpiresIn,
      });

      setInvites([...invites, newInvite]);
      setShowCreateInvite(false);
      setInviteRole('STUDENT');
      setInviteMaxUses(1);
      setInviteExpiresIn(7);
    } catch (err: any) {
      console.error('Failed to create invite:', err);
      alert(err.message || 'Ошибка создания приглашения');
    }
  };

  const handleDeleteInvite = async (inviteId: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить это приглашение?')) {
      return;
    }

    try {
      await invitesService.revokeInvite(courseId, inviteId);
      setInvites(invites.filter(i => i.id !== inviteId));
    } catch (err: any) {
      console.error('Failed to delete invite:', err);
      alert(err.message || 'Ошибка удаления приглашения');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого участника из курса?')) {
      return;
    }

    try {
      await membersService.removeMember(courseId, userId);
      setMembers(members.filter(m => m.user.id !== userId));
    } catch (err: any) {
      console.error('Failed to remove member:', err);
      alert(err.message || 'Ошибка удаления участника');
    }
  };

  const handleLeaveCourse = () => {
    handleLeaveCourseFunc(courseId);
  };

  const copyInviteLink = (code: string) => {
    const link = `${window.location.origin}/join/${code}`;
    navigator.clipboard.writeText(link);
    alert('Ссылка скопирована в буфер обмена!');
  };

  const filteredMembers = members.filter(member => {
    if (filter === 'ALL') return true;
    return member.role === filter;
  });

  const teachers = members.filter(m => m.role === 'TEACHER');
  const students = members.filter(m => m.role === 'STUDENT');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="people-tab">
      <div className="members-section">
        <div className="section-header">
          <h2>Участники</h2>
          <div className="filter-buttons">
            <button
              className={filter === 'ALL' ? 'active' : ''}
              onClick={() => setFilter('ALL')}
            >
              Все ({members.length})
            </button>
            <button
              className={filter === 'TEACHER' ? 'active' : ''}
              onClick={() => setFilter('TEACHER')}
            >
              Преподаватели ({teachers.length})
            </button>
            <button
              className={filter === 'STUDENT' ? 'active' : ''}
              onClick={() => setFilter('STUDENT')}
            >
              Студенты ({students.length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Загрузка участников...</div>
        ) : filteredMembers.length === 0 ? (
          <div className="empty-state">
            <p>Участников не найдено</p>
          </div>
        ) : (
          <div className="members-list">
            {filteredMembers.map(member => (
              <div key={member.user.id} className="member-card">
                <div className="member-avatar">
                  {member.user.displayName.charAt(0)}
                </div>
                <div className="member-info">
                  <div className="member-name">{member.user.displayName}</div>
                  <div className="member-username">@{member.user.username}</div>
                  <div className="member-joined">
                    Присоединился: {formatDate(member.joinedAt)}
                  </div>
                </div>
                <div className="member-actions">
                  <span className={`role-badge ${member.role.toLowerCase()}`}>
                    {member.role === 'TEACHER' ? 'Преподаватель' : 'Студент'}
                  </span>
                  {userRole === 'TEACHER' && member.role === 'STUDENT' && (
                    <button
                      className="remove-button"
                      onClick={() => handleRemoveMember(member.user.id)}
                      title="Удалить из курса"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {userRole === 'TEACHER' && (
        <div className="invites-section">
          <div className="section-header">
            <h2>Приглашения</h2>
            <button
              className="create-invite-button"
              onClick={() => setShowCreateInvite(true)}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
              Создать приглашение
            </button>
          </div>

          {showCreateInvite && (
            <div className="create-invite-form">
              <h3>Новое приглашение</h3>

              <div className="form-group">
                <label>Роль</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as CourseRole)}
                >
                  <option value="STUDENT">Студент</option>
                  <option value="TEACHER">Преподаватель</option>
                </select>
              </div>

              <div className="form-group">
                <label>Максимальное количество использований</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={inviteMaxUses}
                  onChange={(e) => setInviteMaxUses(parseInt(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label>Срок действия (дней)</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={inviteExpiresIn}
                  onChange={(e) => setInviteExpiresIn(parseInt(e.target.value))}
                />
              </div>

              <div className="form-actions">
                <button
                  className="cancel-button"
                  onClick={() => {
                    setShowCreateInvite(false);
                    setInviteRole('STUDENT');
                    setInviteMaxUses(1);
                    setInviteExpiresIn(7);
                  }}
                >
                  Отмена
                </button>
                <button
                  className="submit-button"
                  onClick={handleCreateInvite}
                >
                  Создать
                </button>
              </div>
            </div>
          )}

          {invites.length === 0 ? (
            <div className="empty-invites">
              <p>Активных приглашений нет</p>
            </div>
          ) : (
            <div className="invites-list">
              {invites.map(invite => {
                const isExpired = invite.expiresAt ? new Date(invite.expiresAt) < new Date() : false;
                const isExhausted = invite.maxUses !== null && invite.currentUses >= invite.maxUses;
                const isActive = !isExpired && !isExhausted;

                return (
                  <div key={invite.id} className={`invite-card ${!isActive ? 'inactive' : ''}`}>
                    <div className="invite-info">
                      <div className="invite-code">
                        <strong>Код:</strong> {invite.code}
                      </div>
                      <div className="invite-details">
                        <span className={`role-badge ${invite.role.toLowerCase()}`}>
                          {invite.role === 'TEACHER' ? 'Преподаватель' : 'Студент'}
                        </span>
                        <span>Использовано: {invite.currentUses} / {invite.maxUses || '∞'}</span>
                        <span>Истекает: {invite.expiresAt ? formatDateTime(invite.expiresAt) : 'Бессрочно'}</span>
                      </div>
                      {!isActive && (
                        <div className="invite-status">
                          {isExpired ? '⏰ Истёк срок действия' : '✓ Все использования исчерпаны'}
                        </div>
                      )}
                    </div>
                    <div className="invite-actions">
                      {isActive && (
                        <button
                          className="copy-button"
                          onClick={() => copyInviteLink(invite.code)}
                          title="Скопировать ссылку"
                        >
                          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                          </svg>
                        </button>
                      )}
                      <button
                        className="delete-button"
                        onClick={() => handleDeleteInvite(invite.id)}
                        title="Удалить приглашение"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="danger-zone">
        <h3>Опасная зона</h3>
        <p>После выхода из курса вам нужно будет получить новое приглашение для возвращения.</p>
        <button className="leave-course-button" onClick={handleLeaveCourse}>
          Покинуть курс
        </button>
      </div>
    </div>
  );
}
