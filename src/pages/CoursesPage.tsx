import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import CourseCard from '../components/CourseCard';
import { coursesService } from '../api/services';
import { CourseDto, CreateCourseRequest } from '../types/api';
import './CoursesPage.css';

const CoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<CreateCourseRequest>({
    name: '',
    description: '',
  });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await coursesService.listMyCourses();
      setCourses(response.content);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки курсов');
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

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

  const handleCourseClick = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  const handleCreateCourse = async () => {
    if (!createForm.name.trim()) {
      alert('Введите название курса');
      return;
    }

    try {
      const newCourse = await coursesService.createCourse(createForm);
      setCourses([...courses, newCourse]);
      setShowCreateModal(false);
      setCreateForm({ name: '', description: '' });
      navigate(`/courses/${newCourse.id}`);
    } catch (err: any) {
      alert(err.message || 'Ошибка создания курса');
      console.error('Failed to create course:', err);
    }
  };

  return (
    <div className="courses-page" data-testid="courses-page">
      <Header onMenuClick={handleMenuClick} />
      <Sidebar 
        isOpen={sidebarOpen} 
        isCollapsed={sidebarCollapsed} 
        onClose={handleSidebarClose}
        courses={courses}
        onCourseClick={handleCourseClick}
      />
      <main className={`courses-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="courses-container">
          <div className="courses-header">
            <h1>Мои курсы</h1>
            <button className="create-course-btn" onClick={() => setShowCreateModal(true)}>
              + Создать курс
            </button>
          </div>

          {loading && <div className="loading">Загрузка курсов...</div>}
          {error && <div className="error">{error}</div>}

          {!loading && !error && courses.length === 0 && (
            <div className="empty-state">
              <p>У вас пока нет курсов</p>
              <button onClick={() => setShowCreateModal(true)}>Создать первый курс</button>
            </div>
          )}

          {!loading && !error && courses.length > 0 && (
            <div className="courses-grid" data-testid="courses-list">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onClick={() => handleCourseClick(course.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Создать курс</h2>
            <div className="form-group">
              <label>Название курса *</label>
              <input
                type="text"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="Например: Математика 10А"
              />
            </div>
            <div className="form-group">
              <label>Описание</label>
              <textarea
                value={createForm.description || ''}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                placeholder="Описание курса (необязательно)"
                rows={4}
              />
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowCreateModal(false)}>Отмена</button>
              <button className="primary" onClick={handleCreateCourse}>
                Создать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
