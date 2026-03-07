import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import StreamTab from '../components/course/StreamTab';
import AssignmentsTab from '../components/course/AssignmentsTab';
import PeopleTab from '../components/course/PeopleTab';
import { generateColor } from '../components/CourseCard';
import { coursesService } from '../api/services';
import { CourseDto, UpdateCourseRequest } from '../types/api';
import './CoursePage.css';

const CoursePage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'stream' | 'assignments' | 'people'>('stream');
  const [showCourseMenu, setShowCourseMenu] = useState(false);
  const [showEditCourse, setShowEditCourse] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  
  const [course, setCourse] = useState<CourseDto | null>(null);
  const [allCourses, setAllCourses] = useState<CourseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCourse();
    loadAllCourses();
  }, [courseId]);

  const loadCourse = async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await coursesService.getCourse(courseId);
      setCourse(data);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки курса');
      console.error('Failed to load course:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAllCourses = async () => {
    try {
      const response = await coursesService.listMyCourses();
      setAllCourses(response.content);
    } catch (err: any) {
      console.error('Failed to load courses:', err);
    }
  };

  if (loading) {
    return (
      <div className="courses-page">
        <Header onMenuClick={() => {}} />
        <div className="loading">Загрузка курса...</div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="courses-page">
        <Header onMenuClick={() => {}} />
        <div className="error">{error || 'Курс не найден'}</div>
      </div>
    );
  }
  
  const userRole = "TEACHER" as const;

  const handleMenuClick = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  const handleCourseClick = (clickedCourseId: string) => {
    navigate(`/courses/${clickedCourseId}`);
  };

  const handleEditCourse = () => {
    setEditName(course.name);
    setEditDescription(course.description || '');
    setShowEditCourse(true);
    setShowCourseMenu(false);
  };

  const handleSaveEdit = async () => {
    if (!courseId) return;

    try {
      const updateData: UpdateCourseRequest = {
        name: editName,
        description: editDescription,
      };
      const updatedCourse = await coursesService.updateCourse(courseId, updateData);
      setCourse(updatedCourse);
      setShowEditCourse(false);
    } catch (err: any) {
      alert(err.message || 'Ошибка обновления курса');
      console.error('Failed to update course:', err);
    }
  };

  const handleDeleteCourse = () => {
    setShowCourseMenu(false);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteCourse = async () => {
    if (!courseId) return;

    try {
      await coursesService.deleteCourse(courseId);
      navigate('/courses');
    } catch (err: any) {
      alert(err.message || 'Ошибка удаления курса');
      console.error('Failed to delete course:', err);
    }
  };

  const color = generateColor(course.id);

  return (
    <div className="courses-page">
      <Header onMenuClick={handleMenuClick} />
      <Sidebar
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onClose={handleSidebarClose}
        courses={allCourses}
        onCourseClick={handleCourseClick}
      />
      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Course Header with Banner */}
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

        {/* Course Tabs */}
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

        {/* Course Content */}
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

      {/* Edit Course Modal */}
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

      {/* Delete Course Confirmation */}
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

export default CoursePage;
