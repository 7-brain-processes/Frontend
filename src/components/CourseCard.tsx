import React from 'react';
import './CourseCard.css';

export type CourseRole = 'TEACHER' | 'STUDENT';

export interface Course {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  currentUserRole: CourseRole;
  teacherCount: number;
  studentCount: number;
}

export const generateColor = (id: string): string => {
  const colors = [
    '#1967D2', 
    '#188F58', 
    '#4285F4', 
    '#7C3AED', 
    '#E37400', 
    '#0B8043',
  ];
  
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

interface CourseCardProps {
  course: Course;
  onClick?: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onClick }) => {
  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const color = generateColor(course.id);

  return (
    <div 
      className="course-card" 
      onClick={onClick}
      data-testid="course-item"
    >
      <div 
        className="course-card-header" 
        style={{ backgroundColor: color }}
      >
        <div className="course-card-header-content">
          <h3 className="course-title" data-testid="course-title">
            {course.name}
          </h3>
          <p className="course-description" data-testid="course-description">
            {course.description}
          </p>
          <p className="course-teacher" data-testid="course-teacher">
            {course.teacherCount} {course.teacherCount === 1 ? 'преподаватель' : 'преподавателя'} • {course.studentCount} {course.studentCount === 1 ? 'студент' : 'студентов'}
          </p>
        </div>
        <div className="course-avatar" data-testid="course-avatar">
          {getInitial(course.name)}
        </div>
        <div className="course-card-header-overlay"></div>
      </div>
      <div className="course-card-body">
        <div className="course-card-actions">
          <button 
            className="course-action-button" 
            data-testid="course-members-button"
            onClick={(e) => {
              e.stopPropagation();
            }}
            aria-label="Участники"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
          </button>
          <button 
            className="course-action-button" 
            data-testid="course-folder-button"
            onClick={(e) => {
              e.stopPropagation();
            }}
            aria-label="Папка курса"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
            </svg>
          </button>
          <button 
            className="course-action-button course-menu-button" 
            data-testid="course-menu-button"
            onClick={(e) => {
              e.stopPropagation();
            }}
            aria-label="Меню курса"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
