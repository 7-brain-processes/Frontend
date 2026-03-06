import React, { useState } from 'react';
import './Sidebar.css';
import { Course, generateColor } from './CourseCard';

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  courses?: Course[];
  onCourseClick?: (courseId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, isCollapsed, onClose, courses = [], onCourseClick }) => {
  const [coursesExpanded, setCoursesExpanded] = useState(true);
  const menuItems = [
    {
      id: 'home',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      ),
      label: 'Главная страница',
      testId: 'sidebar-home'
    },
    {
      id: 'calendar',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
        </svg>
      ),
      label: 'Календарь',
      testId: 'sidebar-calendar'
    },
    {
      id: 'courses',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
        </svg>
      ),
      label: 'Курсы',
      testId: 'sidebar-courses',
      active: true,
      expandable: true
    },
    {
      id: 'assignments',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
        </svg>
      ),
      label: 'Список заданий',
      testId: 'sidebar-assignments'
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
                }}
              >
                <span className="sidebar-icon">{item.icon}</span>
                {!isCollapsed && (
                  <>
                    <span className="sidebar-label">{item.label}</span>
                    {item.expandable && (
                      <span className={`expand-icon ${coursesExpanded ? 'expanded' : ''}`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7 10l5 5 5-5z"/>
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
