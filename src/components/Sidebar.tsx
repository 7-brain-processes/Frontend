import React, { useState } from 'react';
import './Sidebar.css';
import { Course, generateColor } from './CourseCard';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  courses?: Course[];
  onCourseClick?: (courseId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, isCollapsed, onClose, courses = [], onCourseClick }) => {
  const navigate = useNavigate();

  const [coursesExpanded, setCoursesExpanded] = useState(true);
  const menuItems = [
    {
      id: 'home',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      ),
      label: 'Главная страница',
      testId: 'sidebar-home'
    },
    {
      id: 'courses',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
        </svg>
      ),
      label: 'Курсы',
      testId: 'sidebar-courses',
      active: true,
      expandable: true
    }
  ];

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`} data-testid="sidebar">
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <div key={item.id}>
              <button
                className={`sidebar-item ${item.active ? 'active' : ''}`}
                data-testid={item.testId}
                title={isCollapsed ? item.label : undefined}
                onClick={() => {
                  if (item.expandable && !isCollapsed) {
                    setCoursesExpanded(!coursesExpanded);
                  }
                  if (item.id === 'home') {
                    navigate('/main');
                  }
                }}
              >
                <span className="sidebar-icon">{item.icon}</span>
                {!isCollapsed && (
                  <>
                    <span className="sidebar-label">{item.label}</span>
                    {item.expandable && (
                      <span className={`expand-icon ${coursesExpanded ? 'expanded' : ''}`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7 10l5 5 5-5z" />
                        </svg>
                      </span>
                    )}
                  </>
                )}
              </button>
              {item.expandable && coursesExpanded && !isCollapsed && courses.length > 0 && (
                <div className="courses-submenu">
                  {courses.map((course) => (
                    <button
                      key={course.id}
                      className="course-submenu-item"
                      data-testid={`sidebar-course-${course.id}`}
                      onClick={() => onCourseClick?.(course.id)}
                    >
                      <span
                        className="course-submenu-color"
                        style={{
                          backgroundColor: generateColor(course.id)
                        }}
                      >
                        {course.name.charAt(0)}
                      </span>
                      <div className="course-submenu-text">
                        <span className="course-submenu-title">{course.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
