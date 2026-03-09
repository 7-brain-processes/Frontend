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
      </div>
    </div>
  );
};

export default CourseCard;
