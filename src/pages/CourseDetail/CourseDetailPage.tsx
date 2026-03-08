import StreamTab from '../../components/course/StreamTab';
import AssignmentsTab from '../../components/course/AssignmentsTab';
import PeopleTab from '../../components/course/PeopleTab';
import { generateColor } from '../../components/CourseCard';
import { useCourseDetailPage } from './hooks/useCourseDetailPage';
import './CourseDetailPage.css';

const CourseDetailPage = () => {
  const { state, functions } = useCourseDetailPage();
  const {
    activeTab,
    showCourseMenu,
    showEditCourse,
    showDeleteConfirm,
    editName,
    editDescription,
    course,
    loading,
    error,
  } = state;

  const {
    setActiveTab,
    setShowCourseMenu,
    setShowEditCourse,
    setShowDeleteConfirm,
    setEditName,
    setEditDescription,
    handleEditCourse,
    handleSaveEdit,
    handleDeleteCourse,
    confirmDeleteCourse,
  } = functions;

  if (loading) {
    return (
      <div className="courses-page">
        <div className="loading">Загрузка курса...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="courses-page">
        <div className="error">{error || 'Курс не найден'}</div>
      </div>
    );
  }
  
  const userRole = course.currentUserRole;
  const color = generateColor(course.id);

  return (
    <div className="courses-page">
      {error && (
        <div style={{
          backgroundColor: '#fff3cd',
          color: '#856404',
          padding: '12px 20px',
          borderBottom: '1px solid #ffeaa7',
          textAlign: 'center',
          fontSize: '14px'
        }}>
          ⚠️ {error}
        </div>
      )}

      <main className="main-content">
        <div className="course-header" style={{ backgroundColor: color }}>
          <div className="course-header-content">
            <h1 className="course-page-title" data-testid="course-page-title">{course.name}</h1>
            <p className="course-page-subtitle" data-testid="course-page-subtitle">{course.description}</p>
          </div>
          {userRole === 'TEACHER' && (
            <div className="course-header-actions">
              <button 
                className="course-menu-button"
                onClick={() => setShowCourseMenu(!showCourseMenu)}
                data-testid="course-menu-button"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
              </button>
              {showCourseMenu && (
                <div className="course-menu-dropdown">
                  <button onClick={handleEditCourse} data-testid="edit-course-button">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                    Редактировать курс
                  </button>
                  <button onClick={handleDeleteCourse} className="danger" data-testid="delete-course-button">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                    Удалить курс
                  </button>
                </div>
              )}
            </div>
          )}
          <div className="course-header-overlay"></div>
        </div>

        <div className="course-tabs" data-testid="course-tabs">
          <button
            className={`course-tab ${activeTab === 'stream' ? 'active' : ''}`}
            onClick={() => setActiveTab('stream')}
            data-testid="tab-stream"
          >
            Лента
          </button>
          <button
            className={`course-tab ${activeTab === 'assignments' ? 'active' : ''}`}
            onClick={() => setActiveTab('assignments')}
            data-testid="tab-assignments"
          >
            Задания
          </button>
          <button
            className={`course-tab ${activeTab === 'people' ? 'active' : ''}`}
            onClick={() => setActiveTab('people')}
            data-testid="tab-people"
          >
            Пользователи
          </button>
        </div>

        <div className="course-content">
          {activeTab === 'stream' && (
            <StreamTab courseId={course.id} userRole={userRole} />
          )}

          {activeTab === 'assignments' && (
            <AssignmentsTab courseId={course.id} userRole={userRole} />
          )}

          {activeTab === 'people' && (
            <PeopleTab courseId={course.id} userRole={userRole} />
          )}
        </div>
      </main>

      {showEditCourse && (
        <div className="modal-overlay" onClick={() => setShowEditCourse(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Редактировать курс</h2>
              <button className="close-button" onClick={() => setShowEditCourse(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="course-name">Название курса</label>
                <input
                  id="course-name"
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  placeholder="Введите название курса"
                  data-testid="edit-course-name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="course-description">Описание</label>
                <textarea
                  id="course-description"
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  placeholder="Введите описание курса"
                  rows={4}
                  data-testid="edit-course-description"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="button-secondary" onClick={() => setShowEditCourse(false)}>
                Отмена
              </button>
              <button className="button-primary" onClick={handleSaveEdit} data-testid="save-course-button">
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Удалить курс</h2>
              <button className="close-button" onClick={() => setShowDeleteConfirm(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <p>Вы уверены, что хотите удалить курс <strong>"{course.name}"</strong>? Это действие нельзя отменить.</p>
            </div>
            <div className="modal-footer">
              <button className="button-secondary" onClick={() => setShowDeleteConfirm(false)}>
                Отмена
              </button>
              <button className="button-danger" onClick={confirmDeleteCourse} data-testid="confirm-delete-course">
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetailPage;