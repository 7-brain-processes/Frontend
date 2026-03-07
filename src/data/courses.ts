import { Course } from '../components/CourseCard';

// Тестовые данные курсов (в будущем будет загружаться из API)
export const mockCourses: Course[] = [
  {
    id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    name: 'Тест',
    description: 'Тест',
    createdAt: '2025-09-02T14:00:00Z',
    currentUserRole: 'STUDENT',
    teacherCount: 1,
    studentCount: 42
  },
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    name: 'Тест',
    description: 'Тест',
    createdAt: '2025-09-02T14:00:00Z',
    currentUserRole: 'STUDENT',
    teacherCount: 1,
    studentCount: 42
  },
  {
    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    name: 'Тест',
    description: 'Тест',
    createdAt: '2025-09-02T14:00:00Z',
    currentUserRole: 'STUDENT',
    teacherCount: 1,
    studentCount: 42
  },
  {
    id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    name: 'Тест',
    description: 'Тест',
    createdAt: '2025-09-02T14:00:00Z',
    currentUserRole: 'STUDENT',
    teacherCount: 1,
    studentCount: 42
  },
];
